import datetime

from app.models.receipt import Receipt
from app.services.summary_service import get_available_months, get_monthly_summary


def _create_receipt(db, *, date, total_amount, category=None):
    receipt = Receipt(
        date=date,
        total_amount=total_amount,
        category=category,
        image_path="test.jpg",
    )
    db.add(receipt)
    db.commit()
    return receipt


class TestGetMonthlySummary:
    def test_basic_aggregation(self, db):
        _create_receipt(db, date=datetime.date(2025, 1, 10), total_amount=1000, category="食費")
        _create_receipt(db, date=datetime.date(2025, 1, 20), total_amount=2000, category="食費")
        _create_receipt(db, date=datetime.date(2025, 1, 15), total_amount=500, category="交通費")

        result = get_monthly_summary(db, 2025, 1)

        assert result.year == 2025
        assert result.month == 1
        assert result.total_amount == 3500
        assert result.total_count == 3
        assert len(result.categories) == 2

        by_cat = {c.category: c for c in result.categories}
        assert by_cat["食費"].total_amount == 3000
        assert by_cat["食費"].count == 2
        assert by_cat["交通費"].total_amount == 500
        assert by_cat["交通費"].count == 1

    def test_no_data_returns_zero(self, db):
        result = get_monthly_summary(db, 2025, 6)

        assert result.total_amount == 0
        assert result.total_count == 0
        assert result.categories == []

    def test_null_category_becomes_uncategorized(self, db):
        _create_receipt(db, date=datetime.date(2025, 3, 1), total_amount=800, category=None)

        result = get_monthly_summary(db, 2025, 3)

        assert len(result.categories) == 1
        assert result.categories[0].category == "未分類"

    def test_excludes_other_months(self, db):
        _create_receipt(db, date=datetime.date(2025, 1, 10), total_amount=1000, category="食費")
        _create_receipt(db, date=datetime.date(2025, 2, 10), total_amount=2000, category="食費")

        result = get_monthly_summary(db, 2025, 1)

        assert result.total_amount == 1000
        assert result.total_count == 1


class TestGetAvailableMonths:
    def test_returns_months_descending(self, db):
        _create_receipt(db, date=datetime.date(2025, 1, 10), total_amount=100)
        _create_receipt(db, date=datetime.date(2025, 3, 10), total_amount=200)
        _create_receipt(db, date=datetime.date(2024, 12, 10), total_amount=300)

        result = get_available_months(db)

        assert len(result.months) == 3
        assert result.months[0].year == 2025
        assert result.months[0].month == 3
        assert result.months[1].year == 2025
        assert result.months[1].month == 1
        assert result.months[2].year == 2024
        assert result.months[2].month == 12

    def test_empty_db_returns_empty(self, db):
        result = get_available_months(db)
        assert result.months == []

    def test_excludes_null_dates(self, db):
        _create_receipt(db, date=None, total_amount=100)
        _create_receipt(db, date=datetime.date(2025, 5, 1), total_amount=200)

        result = get_available_months(db)

        assert len(result.months) == 1
        assert result.months[0].month == 5
