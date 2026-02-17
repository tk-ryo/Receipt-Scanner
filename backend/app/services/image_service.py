import asyncio
import io
import logging
import uuid
from pathlib import Path

from fastapi import UploadFile
from PIL import Image

from app.config import ALLOWED_MIME_TYPES, MAX_FILE_SIZE, THUMBNAIL_DIR, UPLOAD_DIR

logger = logging.getLogger(__name__)

EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}

FORMAT_TO_EXT = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}


def validate_image(file: UploadFile) -> None:
    """MIMEタイプを検証する（Content-Type ヘッダーの事前チェック）。"""
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise ValueError(
            f"対応していないファイル形式です: {file.content_type}（JPEG/PNG/WebPのみ対応）"
        )


def _validate_image_content(content: bytes) -> str:
    """マジックバイトを検証し、検出された画像フォーマットを返す。"""
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
        if img.format not in ALLOWED_IMAGE_FORMATS:
            raise ValueError("サポートされていない画像形式です")
        return img.format
    except ValueError:
        raise
    except Exception:
        raise ValueError("有効な画像ファイルではありません")


async def save_image(file: UploadFile) -> str:
    """画像をUUID名で uploads/ に保存し、相対パスを返す。"""
    validate_image(file)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(
            f"ファイルサイズが上限を超えています: {len(content)} bytes（上限: {MAX_FILE_SIZE // 1024 // 1024}MB）"
        )

    image_format = _validate_image_content(content)

    ext = FORMAT_TO_EXT.get(image_format, ".jpg")
    filename = f"{uuid.uuid4()}{ext}"
    filepath = UPLOAD_DIR / filename

    await asyncio.to_thread(filepath.write_bytes, content)

    return f"/uploads/{filename}"


def generate_thumbnail(image_path: str, size: tuple[int, int] = (200, 200)) -> str | None:
    """画像からサムネイルを生成し、uploads/thumbs/ に保存する。パスを返す。"""
    try:
        source = UPLOAD_DIR.parent / image_path.lstrip("/")
        if not source.resolve().is_relative_to(UPLOAD_DIR):
            logger.warning("パストラバーサル検出: %s", image_path)
            return None
        if not source.exists():
            return None

        with Image.open(source) as img:
            img.thumbnail(size)
            thumb_name = f"{uuid.uuid4()}.jpg"
            thumb_path = THUMBNAIL_DIR / thumb_name
            img.convert("RGB").save(thumb_path, "JPEG", quality=85)

        return f"/uploads/thumbs/{thumb_name}"
    except Exception:
        logger.warning("サムネイル生成に失敗しました: %s", image_path, exc_info=True)
        return None
