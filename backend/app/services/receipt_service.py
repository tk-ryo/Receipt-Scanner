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


def get_receipts(db: Session, skip: int = 0, limit: int = 20) -> tuple[list[Receipt], int]:
    """レシート一覧を取得する。(items, total) を返す。"""
    total = db.query(Receipt).count()
    items = (
        db.query(Receipt)
        .order_by(Receipt.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
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
