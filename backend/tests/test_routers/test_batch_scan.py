"""一括スキャンのテスト"""
import io
from unittest.mock import AsyncMock, MagicMock, patch

from app.schemas.receipt import VisionResponse


def _make_image_file(name="test.jpg", content_type="image/jpeg"):
    """テスト用の最小画像ファイルを作成する。"""
    # 1x1 JPEG
    jpeg_bytes = (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
        b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
        b"\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342"
        b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00"
        b"\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00"
        b"\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b"
        b"\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04"
        b"\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"
        b"\x22q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16"
        b"\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz"
        b"\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99"
        b"\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7"
        b"\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5"
        b"\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1"
        b"\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa"
        b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00T\xdb\x9e\xa3\x13\xa1"
        b"\xff\xd9"
    )
    return (name, io.BytesIO(jpeg_bytes), content_type)


@patch("app.routers.receipts.generate_thumbnail", return_value="/uploads/thumbs/t.jpg")
@patch("app.routers.receipts.save_image", new_callable=AsyncMock, return_value="/uploads/test.jpg")
@patch("app.routers.receipts.analyze_receipt", new_callable=AsyncMock)
def test_batch_scan_success(mock_analyze, mock_save, mock_thumb, client, db):
    """複数ファイルが全て成功する場合のテスト"""
    vision = VisionResponse(
        store_name="テスト店",
        total_amount=500,
        category="食費",
    )
    mock_analyze.return_value = (vision, "{}")

    files = [
        ("files", _make_image_file("receipt1.jpg")),
        ("files", _make_image_file("receipt2.jpg")),
    ]

    response = client.post("/api/receipts/scan/batch", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["success_count"] == 2
    assert data["error_count"] == 0
    assert len(data["results"]) == 2
    assert all(r["success"] for r in data["results"])


@patch("app.routers.receipts.generate_thumbnail", return_value="/uploads/thumbs/t.jpg")
@patch("app.routers.receipts.save_image", new_callable=AsyncMock, return_value="/uploads/test.jpg")
@patch("app.routers.receipts.analyze_receipt", new_callable=AsyncMock)
def test_batch_scan_partial_failure(mock_analyze, mock_save, mock_thumb, client, db):
    """一部のファイルが失敗する場合のテスト"""
    vision = VisionResponse(
        store_name="テスト店",
        total_amount=500,
        category="食費",
    )

    results = iter([(vision, "{}"), ValueError("解析エラー"), (vision, "{}")])

    async def side_effect(*args, **kwargs):
        result = next(results)
        if isinstance(result, Exception):
            raise result
        return result

    mock_analyze.side_effect = side_effect

    files = [
        ("files", _make_image_file("ok.jpg")),
        ("files", _make_image_file("fail.jpg")),
        ("files", _make_image_file("ok2.jpg")),
    ]

    response = client.post("/api/receipts/scan/batch", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["success_count"] == 2
    assert data["error_count"] == 1
    assert data["results"][0]["success"] is True
    assert data["results"][1]["success"] is False
    assert data["results"][1]["error"] is not None
    assert data["results"][2]["success"] is True
