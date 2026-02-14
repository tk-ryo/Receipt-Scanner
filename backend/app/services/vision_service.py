import base64
import json
import re
from pathlib import Path

import anthropic

from app.config import ANTHROPIC_API_KEY, MOCK_VISION, VISION_MODEL
from app.schemas.receipt import VisionResponse

MOCK_RESPONSE = {
    "store_name": "テストマート 渋谷店",
    "date": "2026-02-10",
    "total_amount": 1580,
    "tax": 143,
    "items": [
        {"name": "おにぎり 鮭", "quantity": 2, "price": 150},
        {"name": "緑茶 500ml", "quantity": 1, "price": 130},
        {"name": "サンドイッチ", "quantity": 1, "price": 380},
        {"name": "ヨーグルト", "quantity": 3, "price": 120},
    ],
    "payment_method": "クレジットカード",
    "category": "食費",
}

PROMPT = """このレシート画像から以下の情報をJSON形式で抽出してください。

{
  "store_name": "店名",
  "date": "YYYY-MM-DD",
  "total_amount": 数値,
  "tax": 数値,
  "items": [
    { "name": "品名", "quantity": 数量, "price": 単価 }
  ],
  "payment_method": "現金 / クレジットカード / 電子マネー / QRコード決済 / 不明",
  "category": "カテゴリ（下記参照）"
}

カテゴリ判定基準（店名・品目から総合的に判断）:
- 食費: スーパー、コンビニ、飲食店、食料品
- 交通費: 鉄道、バス、タクシー、ガソリンスタンド、駐車場、高速道路
- 日用品: ドラッグストア（医薬品以外）、ホームセンター、100円ショップ、洗剤・ティッシュ等
- 医療費: 病院、薬局（処方薬）、医薬品
- 通信費: 携帯電話、インターネット、プロバイダ
- 光熱費: 電気、ガス、水道
- 交際費: 接待、贈答品、冠婚葬祭
- 衣服・美容: 衣料品店、美容院、クリーニング
- 教育・書籍: 書店、文房具、セミナー、学費
- 娯楽・趣味: 映画、ゲーム、スポーツ、旅行
- 住居費: 家賃、不動産、リフォーム
- 保険: 保険料
- 税金: 税金、公共料金
- 雑費: 上記に該当しないもの
- その他: 判断できない場合

ルール:
- 読み取れない項目は null としてください
- 金額は数値（整数または小数）で返してください（円記号やカンマは不要）
- 日付は YYYY-MM-DD 形式で返してください
- items の quantity が不明なら 1 としてください
- JSON のみ出力してください（説明文は不要）"""

MIME_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def _encode_image(image_path: str) -> tuple[str, str]:
    """画像ファイルをbase64エンコードし、(base64文字列, media_type) を返す。"""
    path = Path(image_path)
    media_type = MIME_MAP.get(path.suffix.lower(), "image/jpeg")
    data = path.read_bytes()
    return base64.standard_b64encode(data).decode("utf-8"), media_type


def _extract_json(text: str) -> dict:
    """テキストからJSONを抽出する。コードブロック内のJSON、または生JSONに対応。"""
    # まず ```json ... ``` ブロックを探す
    match = re.search(r"```(?:json)?\s*(\{.*?})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))

    # 次に最初の { ... } ブロックを探す
    match = re.search(r"\{.*}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError("APIレスポンスからJSONを抽出できませんでした")


async def analyze_receipt(image_path: str) -> tuple[VisionResponse, str]:
    """
    画像を Claude Vision API で解析し、構造化データを返す。

    Returns:
        (VisionResponse, raw_response): 解析結果と生レスポンス文字列
    """
    if MOCK_VISION:
        raw = json.dumps(MOCK_RESPONSE, ensure_ascii=False)
        return VisionResponse.model_validate(MOCK_RESPONSE), raw

    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY が設定されていません")

    b64_data, media_type = _encode_image(image_path)

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    message = client.messages.create(
        model=VISION_MODEL,
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": PROMPT,
                    },
                ],
            }
        ],
    )

    raw_text = message.content[0].text
    parsed = _extract_json(raw_text)
    if parsed.get("items") is None:
        parsed["items"] = []
    vision_response = VisionResponse.model_validate(parsed)

    return vision_response, raw_text
