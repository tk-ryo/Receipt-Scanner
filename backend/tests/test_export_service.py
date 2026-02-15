"""CSV生成ロジックのテスト"""
import datetime

from app.models.receipt import Receipt, ReceiptItem
from app.services.export_service import generate_csv


def test_generate_csv_with_receipts(db):
    """レシートからCSV文字列が正しく生成されること"""
    receipt = Receipt(
        store_name="テスト店",
        date=datetime.date(2025, 6, 1),
        total_amount=1500.0,
        tax=150.0,
        payment_method="現金",
        category="食費",
        image_path="/uploads/test.jpg",
    )
    receipt.items.append(ReceiptItem(name="りんご", quantity=2, price=300))
    receipt.items.append(ReceiptItem(name="みかん", quantity=3, price=200))
    db.add(receipt)
    db.commit()
    db.refresh(receipt)

    csv_content = generate_csv([receipt])

    assert csv_content.startswith("\ufeff")  # BOM
    lines = csv_content.strip().split("\n")
    assert len(lines) == 2  # ヘッダー + 1行
    assert "テスト店" in lines[1]
    assert "りんご" in lines[1]
    assert "1500" in lines[1]


def test_generate_csv_empty():
    """空のリストでもヘッダーだけのCSVが生成されること"""
    csv_content = generate_csv([])

    assert csv_content.startswith("\ufeff")
    lines = csv_content.strip().split("\n")
    assert len(lines) == 1  # ヘッダーのみ
    assert "ID" in lines[0]
