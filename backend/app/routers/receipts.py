from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.database import get_db
from app.schemas.receipt import ReceiptResponse
from app.services.image_service import save_image
from app.services.receipt_service import create_receipt
from app.services.vision_service import analyze_receipt

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.post("/scan", response_model=ReceiptResponse, status_code=201)
async def scan_receipt(file: UploadFile, db: Session = Depends(get_db)):
    """レシート画像をアップロードし、AI解析してDBに保存する。"""
    # 1. 画像保存
    try:
        image_path = await save_image(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Vision API で解析
    try:
        absolute_path = str(UPLOAD_DIR.parent / image_path.lstrip("/"))
        vision, raw_response = await analyze_receipt(absolute_path)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI解析中にエラーが発生しました: {e}")

    # 3. DB保存
    receipt = create_receipt(db, image_path, vision, raw_response)

    return receipt
