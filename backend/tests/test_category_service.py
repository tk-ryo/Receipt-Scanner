"""カテゴリ分類ロジックのテスト"""
from app.services.category_service import classify_by_items


def test_classify_food_items():
    """食品の品目から食費と判定されること"""
    items = [
        {"name": "おにぎり 鮭", "quantity": 2, "price": 150},
        {"name": "緑茶 500ml", "quantity": 1, "price": 130},
    ]
    assert classify_by_items(items) == "食費"


def test_classify_transport_items():
    """交通系の品目から交通費と判定されること"""
    items = [
        {"name": "タクシー料金", "quantity": 1, "price": 2500},
    ]
    assert classify_by_items(items) == "交通費"


def test_classify_daily_items():
    """日用品の品目から日用品と判定されること"""
    items = [
        {"name": "洗剤", "quantity": 1, "price": 300},
        {"name": "ティッシュ 5箱", "quantity": 1, "price": 250},
    ]
    assert classify_by_items(items) == "日用品"


def test_classify_mixed_items_returns_majority():
    """複数カテゴリの品目がある場合、多数派カテゴリが返ること"""
    items = [
        {"name": "おにぎり", "quantity": 1, "price": 150},
        {"name": "パン", "quantity": 1, "price": 200},
        {"name": "洗剤", "quantity": 1, "price": 300},
    ]
    assert classify_by_items(items) == "食費"


def test_classify_unknown_items_returns_none():
    """該当キーワードがない場合は None が返ること"""
    items = [
        {"name": "不明な商品XYZ", "quantity": 1, "price": 1000},
    ]
    assert classify_by_items(items) is None


def test_classify_empty_items_returns_none():
    """空リストの場合は None が返ること"""
    assert classify_by_items([]) is None
