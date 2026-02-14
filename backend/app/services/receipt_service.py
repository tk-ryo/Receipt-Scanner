from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.receipt import Receipt, ReceiptItem
from app.schemas.receipt import ReceiptUpdate, VisionResponse


def create_receipt(
    db: Session,
    image_path: str,
    vision: VisionResponse,
    raw_response: str,
) -> Receipt:
    """解析結果からレシートをDBに保存する。"""
    receipt = Receipt(
        store_name=vision.store_name,
        date=vision.date,
        total_amount=vision.total_amount,
        tax=vision.tax,
        payment_method=vision.payment_method,
        category=vision.category,
        image_path=image_path,
        raw_response=raw_response,
    )
    for item_data in vision.items:
        receipt.items.append(
            ReceiptItem(
                name=item_data.name,
                quantity=item_data.quantity,
                price=item_data.price,
            )
        )

    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt


def get_receipts(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    date_from: date | None = None,
    date_to: date | None = None,
    category: str | None = None,
    amount_min: float | None = None,
    amount_max: float | None = None,
    search: str | None = None,
) -> tuple[list[Receipt], int]:
    """レシート一覧を取得する。(items, total) を返す。"""
    query = db.query(Receipt)

    # フィルタ
    if date_from:
        query = query.filter(Receipt.date >= date_from)
    if date_to:
        query = query.filter(Receipt.date <= date_to)
    if category:
        query = query.filter(Receipt.category == category)
    if amount_min is not None:
        query = query.filter(Receipt.total_amount >= amount_min)
    if amount_max is not None:
        query = query.filter(Receipt.total_amount <= amount_max)
    if search:
        query = query.filter(Receipt.store_name.ilike(f"%{search}%"))

    total = query.count()

    # ソート
    sort_column = getattr(Receipt, sort_by, Receipt.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    items = query.offset(skip).limit(limit).all()
    return items, total


def get_receipt(db: Session, receipt_id: int) -> Receipt | None:
    """IDでレシートを取得する。見つからなければ None。"""
    return db.query(Receipt).filter(Receipt.id == receipt_id).first()


def update_receipt(db: Session, receipt: Receipt, data: ReceiptUpdate) -> Receipt:
    """レシートを更新する。品目は洗い替え（全削除→再作成）。"""
    receipt.store_name = data.store_name
    receipt.date = data.date
    receipt.total_amount = data.total_amount
    receipt.tax = data.tax
    receipt.payment_method = data.payment_method
    receipt.category = data.category

    # 品目を洗い替え
    receipt.items.clear()
    for item_data in data.items:
        receipt.items.append(
            ReceiptItem(
                name=item_data.name,
                quantity=item_data.quantity,
                price=item_data.price,
            )
        )

    db.commit()
    db.refresh(receipt)
    return receipt


def delete_receipt(db: Session, receipt: Receipt, upload_dir: Path) -> None:
    """レシートをDBから削除し、画像ファイルも削除する。"""
    # 画像ファイル削除
    image_file = upload_dir / Path(receipt.image_path).name
    if image_file.exists():
        image_file.unlink()

    db.delete(receipt)
    db.commit()
