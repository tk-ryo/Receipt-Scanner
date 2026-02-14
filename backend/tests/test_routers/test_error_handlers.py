"""グローバル例外ハンドラの動作確認テスト"""


def test_validation_error_returns_422_with_japanese_message(client):
    """不正なクエリパラメータで RequestValidationError が返ること"""
    response = client.get("/api/receipts", params={"skip": "abc"})
    assert response.status_code == 422
    data = response.json()
    assert data["detail"] == "入力値が正しくありません"
    assert "errors" in data


def test_validation_error_on_invalid_limit(client):
    """limit に範囲外の値を指定して RequestValidationError が返ること"""
    response = client.get("/api/receipts", params={"limit": -1})
    assert response.status_code == 422
    data = response.json()
    assert data["detail"] == "入力値が正しくありません"


def test_not_found_receipt_returns_404(client):
    """存在しないレシートIDで 404 が返ること"""
    response = client.get("/api/receipts/99999")
    assert response.status_code == 404
    data = response.json()
    assert "見つかりません" in data["detail"]


def test_scan_without_file_returns_422(client):
    """ファイル未指定でスキャンすると 422 が返ること"""
    response = client.post("/api/receipts/scan")
    assert response.status_code == 422
