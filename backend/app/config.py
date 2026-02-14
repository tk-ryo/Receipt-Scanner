import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
THUMBNAIL_DIR = UPLOAD_DIR / "thumbs"
THUMBNAIL_DIR.mkdir(exist_ok=True)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
VISION_MODEL = os.getenv("VISION_MODEL", "claude-sonnet-4-20250514")
MOCK_VISION = os.getenv("MOCK_VISION", "").lower() in ("1", "true", "yes")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'receipts.db'}")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
