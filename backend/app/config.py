import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

_logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
THUMBNAIL_DIR = UPLOAD_DIR / "thumbs"
THUMBNAIL_DIR.mkdir(exist_ok=True)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
VISION_MODEL = os.getenv("VISION_MODEL", "claude-sonnet-4-20250514")
MOCK_VISION = os.getenv("MOCK_VISION", "").lower() in ("1", "true", "yes")

if not ANTHROPIC_API_KEY and not MOCK_VISION:
    _logger.warning("ANTHROPIC_API_KEY が未設定です。Vision API の呼び出しは失敗します。")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'receipts.db'}")

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

CATEGORIES = [
    "食費",
    "交通費",
    "日用品",
    "医療費",
    "通信費",
    "光熱費",
    "交際費",
    "衣服・美容",
    "教育・書籍",
    "娯楽・趣味",
    "住居費",
    "保険",
    "税金",
    "雑費",
    "その他",
]
