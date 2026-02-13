from sqlalchemy.orm import Session

from app.models.receipt import Receipt, ReceiptItem
from app.schemas.receipt import VisionResponse


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
