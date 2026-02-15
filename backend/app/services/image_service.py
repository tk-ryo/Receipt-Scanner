import logging
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import ALLOWED_MIME_TYPES, MAX_FILE_SIZE, THUMBNAIL_DIR, UPLOAD_DIR

logger = logging.getLogger(__name__)

EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def validate_image(file: UploadFile) -> None:
    """MIMEタイプとファイルサイズを検証する。"""
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise ValueError(
            f"対応していないファイル形式です: {file.content_type}（JPEG/PNG/WebPのみ対応）"
        )


async def save_image(file: UploadFile) -> str:
    """画像をUUID名で uploads/ に保存し、相対パスを返す。"""
    validate_image(file)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(
            f"ファイルサイズが上限を超えています: {len(content)} bytes（上限: {MAX_FILE_SIZE // 1024 // 1024}MB）"
        )

    ext = EXTENSION_MAP.get(file.content_type, ".jpg")
    filename = f"{uuid.uuid4()}{ext}"
    filepath = UPLOAD_DIR / filename

    filepath.write_bytes(content)

    return f"/uploads/{filename}"


def generate_thumbnail(image_path: str, size: tuple[int, int] = (200, 200)) -> str | None:
    """画像からサムネイルを生成し、uploads/thumbs/ に保存する。パスを返す。"""
    try:
        from PIL import Image

        source = UPLOAD_DIR.parent / image_path.lstrip("/")
        if not source.exists():
            return None

        img = Image.open(source)
        img.thumbnail(size)

        thumb_name = f"{uuid.uuid4()}.jpg"
        thumb_path = THUMBNAIL_DIR / thumb_name
        img.convert("RGB").save(thumb_path, "JPEG", quality=85)

        return f"/uploads/thumbs/{thumb_name}"
    except Exception:
        logger.warning("サムネイル生成に失敗しました: %s", image_path, exc_info=True)
        return None
