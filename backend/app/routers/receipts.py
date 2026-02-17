import datetime
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.database import get_db
from app.schemas.receipt import (
    BatchScanResponse,
    BatchScanResultItem,
    ReceiptListResponse,
    ReceiptResponse,
    ReceiptUpdate,
)
from app.services.category_service import classify_by_items
from app.services.export_service import generate_csv
from app.services.image_service import generate_thumbnail, save_image
from app.services.receipt_service import (
    ALLOWED_SORT_FIELDS,
    create_receipt,
    delete_receipt,
    get_receipt,
    get_receipts,
    update_receipt,
)
from app.services.vision_service import analyze_receipt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/receipts", tags=["receipts"])


def _cleanup_uploaded_file(image_path: str) -> None:
    """アップロード済みファイルを削除する（解析失敗時のクリーンアップ）。"""
    try:
        filepath = UPLOAD_DIR / Path(image_path).name
        if filepath.exists():
            filepath.unlink()
    except Exception:
        logger.warning("クリーンアップ失敗: %s", image_path, exc_info=True)


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
        _cleanup_uploaded_file(image_path)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        _cleanup_uploaded_file(image_path)
        raise HTTPException(status_code=500, detail=f"AI解析中にエラーが発生しました: {e}")

    # 3. カテゴリ補完（Vision API が null の場合）
    if not vision.category and vision.items:
        items_dicts = [item.model_dump() for item in vision.items]
        inferred = classify_by_items(items_dicts)
        if inferred:
            vision.category = inferred

    # 4. サムネイル生成
    thumbnail_path = generate_thumbnail(image_path)

    # 5. DB保存
    receipt = create_receipt(db, image_path, vision, raw_response, thumbnail_path=thumbnail_path)

    return receipt


@router.post("/scan/batch", response_model=BatchScanResponse, status_code=201)
async def batch_scan_receipts(
    files: list[UploadFile],
    db: Session = Depends(get_db),
):
    """複数のレシート画像を一括アップロードし、順次AI解析してDBに保存する。"""
    results: list[BatchScanResultItem] = []
    success_count = 0
    error_count = 0

    for file in files:
        filename = file.filename or "unknown"
        saved_image_path = None
        try:
            # 1. 画像保存
            saved_image_path = await save_image(file)

            # 2. Vision API で解析
            absolute_path = str(UPLOAD_DIR.parent / saved_image_path.lstrip("/"))
            vision, raw_response = await analyze_receipt(absolute_path)

            # 3. カテゴリ補完
            if not vision.category and vision.items:
                items_dicts = [item.model_dump() for item in vision.items]
                inferred = classify_by_items(items_dicts)
                if inferred:
                    vision.category = inferred

            # 4. サムネイル生成
            thumbnail_path = generate_thumbnail(saved_image_path)

            # 5. DB保存
            receipt = create_receipt(db, saved_image_path, vision, raw_response, thumbnail_path=thumbnail_path)

            results.append(BatchScanResultItem(
                filename=filename,
                success=True,
                receipt=ReceiptResponse.model_validate(receipt),
            ))
            success_count += 1
        except Exception as e:
            logger.warning("Batch scan failed for %s: %s", filename, e)
            if saved_image_path:
                _cleanup_uploaded_file(saved_image_path)
            results.append(BatchScanResultItem(
                filename=filename,
                success=False,
                error=str(e),
            ))
            error_count += 1

    return BatchScanResponse(
        results=results,
        success_count=success_count,
        error_count=error_count,
    )


@router.get("", response_model=ReceiptListResponse)
def list_receipts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    date_from: datetime.date | None = Query(None),
    date_to: datetime.date | None = Query(None),
    category: str | None = Query(None),
    amount_min: float | None = Query(None),
    amount_max: float | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """レシート一覧を取得する（ページネーション・フィルタ・ソート対応）。"""
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(status_code=400, detail="無効なソートフィールドです")
    items, total = get_receipts(
        db,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
        date_from=date_from,
        date_to=date_to,
        category=category,
        amount_min=amount_min,
        amount_max=amount_max,
        search=search,
    )
    return ReceiptListResponse(items=items, total=total)


@router.get("/export/csv")
def export_csv(
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    date_from: datetime.date | None = Query(None),
    date_to: datetime.date | None = Query(None),
    category: str | None = Query(None),
    amount_min: float | None = Query(None),
    amount_max: float | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """フィルタ条件に合致するレシートをCSVでエクスポートする。"""
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(status_code=400, detail="無効なソートフィールドです")
    items, _ = get_receipts(
        db,
        skip=0,
        limit=10000,
        sort_by=sort_by,
        sort_order=sort_order,
        date_from=date_from,
        date_to=date_to,
        category=category,
        amount_min=amount_min,
        amount_max=amount_max,
        search=search,
    )
    csv_content = generate_csv(items)

    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=receipts.csv"},
    )


@router.get("/{receipt_id}", response_model=ReceiptResponse)
def read_receipt(receipt_id: int, db: Session = Depends(get_db)):
    """レシート詳細を取得する。"""
    receipt = get_receipt(db, receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="レシートが見つかりません")
    return receipt


@router.put("/{receipt_id}", response_model=ReceiptResponse)
def edit_receipt(receipt_id: int, data: ReceiptUpdate, db: Session = Depends(get_db)):
    """レシートを更新する（品目の追加・削除・変更含む）。"""
    receipt = get_receipt(db, receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="レシートが見つかりません")
    return update_receipt(db, receipt, data)


@router.delete("/{receipt_id}", status_code=204)
def remove_receipt(receipt_id: int, db: Session = Depends(get_db)):
    """レシートを削除する（画像ファイルも削除）。"""
    receipt = get_receipt(db, receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="レシートが見つかりません")
    delete_receipt(db, receipt, UPLOAD_DIR)
