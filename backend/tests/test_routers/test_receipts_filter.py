"""フィルタ/ソートのクエリテスト"""
import datetime

from app.models.receipt import Receipt


def _create_receipt(db, **kwargs):
    defaults = {
        "store_name": "テスト店",
        "date": datetime.date(2025, 1, 15),
        "total_amount": 1000.0,
        "category": "食費",
        "image_path": "/uploads/test.jpg",
    }
    defaults.update(kwargs)
    receipt = Receipt(**defaults)
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt


def test_list_receipts_default(client, db):
    """デフォルトでレシート一覧が取得できること"""
    _create_receipt(db)
    response = client.get("/api/receipts")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


def test_filter_by_category(client, db):
    """カテゴリでフィルタできること"""
    _create_receipt(db, category="食費", store_name="食品店")
    _create_receipt(db, category="交通費", store_name="タクシー")
    response = client.get("/api/receipts", params={"category": "食費"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["store_name"] == "食品店"


def test_filter_by_date_range(client, db):
    """日付範囲でフィルタできること"""
    _create_receipt(db, date=datetime.date(2025, 1, 10), store_name="A店")
    _create_receipt(db, date=datetime.date(2025, 1, 20), store_name="B店")
    _create_receipt(db, date=datetime.date(2025, 2, 5), store_name="C店")

    response = client.get("/api/receipts", params={"date_from": "2025-01-15", "date_to": "2025-01-31"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["store_name"] == "B店"


def test_filter_by_amount_range(client, db):
    """金額範囲でフィルタできること"""
    _create_receipt(db, total_amount=500, store_name="安い店")
    _create_receipt(db, total_amount=3000, store_name="高い店")

    response = client.get("/api/receipts", params={"amount_min": 1000})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["store_name"] == "高い店"


def test_filter_by_search(client, db):
    """店名検索でフィルタできること"""
    _create_receipt(db, store_name="セブンイレブン")
    _create_receipt(db, store_name="ファミリーマート")

    response = client.get("/api/receipts", params={"search": "セブン"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["store_name"] == "セブンイレブン"


def test_sort_by_total_amount_asc(client, db):
    """金額昇順でソートできること"""
    _create_receipt(db, total_amount=3000, store_name="高い店")
    _create_receipt(db, total_amount=500, store_name="安い店")

    response = client.get("/api/receipts", params={"sort_by": "total_amount", "sort_order": "asc"})
    assert response.status_code == 200
    data = response.json()
    assert data["items"][0]["store_name"] == "安い店"
    assert data["items"][1]["store_name"] == "高い店"
