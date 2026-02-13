from fastapi import APIRouter, HTTPException, UploadFile

from app.services.image_service import save_image

router = APIRouter(prefix="/receipts", tags=["receipts"])


@router.post("/scan", status_code=201)
async def scan_receipt(file: UploadFile):
    """レシート画像をアップロードし、保存する。"""
    try:
        image_path = await save_image(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"image_path": image_path, "message": "画像を保存しました"}
