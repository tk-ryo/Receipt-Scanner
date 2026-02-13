import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import ALLOWED_MIME_TYPES, MAX_FILE_SIZE, UPLOAD_DIR

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
