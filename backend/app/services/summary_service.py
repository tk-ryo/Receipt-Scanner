from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.receipt import Receipt
from app.schemas.summary import (
    CategorySummary,
    MonthlyListResponse,
    MonthlySummaryResponse,
    MonthOption,
)


def get_monthly_summary(db: Session, year: int, month: int) -> MonthlySummaryResponse:
    """指定年月のカテゴリ別集計を返す。"""
    rows = (
        db.query(
            func.coalesce(Receipt.category, "未分類").label("category"),
            func.sum(Receipt.total_amount).label("total_amount"),
            func.count(Receipt.id).label("count"),
        )
        .filter(extract("year", Receipt.date) == year)
        .filter(extract("month", Receipt.date) == month)
        .group_by(func.coalesce(Receipt.category, "未分類"))
        .all()
    )

    categories = [
        CategorySummary(
            category=row.category,
            total_amount=row.total_amount or 0,
            count=row.count,
        )
        for row in rows
    ]

    total_amount = sum(c.total_amount for c in categories)
    total_count = sum(c.count for c in categories)

    return MonthlySummaryResponse(
        year=year,
        month=month,
        total_amount=total_amount,
        total_count=total_count,
        categories=categories,
    )


def get_available_months(db: Session) -> MonthlyListResponse:
    """レシートが存在する年月リストを返す（降順）。"""
    rows = (
        db.query(
            extract("year", Receipt.date).label("year"),
            extract("month", Receipt.date).label("month"),
            func.count(Receipt.id).label("count"),
        )
        .filter(Receipt.date.isnot(None))
        .group_by(
            extract("year", Receipt.date),
            extract("month", Receipt.date),
        )
        .order_by(
            extract("year", Receipt.date).desc(),
            extract("month", Receipt.date).desc(),
        )
        .all()
    )

    months = [
        MonthOption(year=int(row.year), month=int(row.month), count=row.count)
        for row in rows
    ]

    return MonthlyListResponse(months=months)
