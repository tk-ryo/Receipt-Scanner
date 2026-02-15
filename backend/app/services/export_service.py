import csv
import io

from app.models.receipt import Receipt


BOM = "\ufeff"

HEADERS = [
    "ID",
    "日付",
    "店名",
    "合計金額",
    "税額",
    "支払方法",
    "カテゴリ",
    "品目",
]


def generate_csv(receipts: list[Receipt]) -> str:
    """レシート一覧からBOM付きUTF-8のCSV文字列を生成する。"""
    output = io.StringIO()
    output.write(BOM)

    writer = csv.writer(output)
    writer.writerow(HEADERS)

    for receipt in receipts:
        items_str = " / ".join(
            f"{item.name or '不明'}×{item.quantity or 1}"
            for item in receipt.items
        ) if receipt.items else ""

        writer.writerow([
            receipt.id,
            str(receipt.date) if receipt.date else "",
            receipt.store_name or "",
            receipt.total_amount if receipt.total_amount is not None else "",
            receipt.tax if receipt.tax is not None else "",
            receipt.payment_method or "",
            receipt.category or "",
            items_str,
        ])

    return output.getvalue()
