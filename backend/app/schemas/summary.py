from __future__ import annotations

from pydantic import BaseModel


class CategorySummary(BaseModel):
    category: str
    total_amount: float
    count: int


class MonthlySummaryResponse(BaseModel):
    year: int
    month: int
    total_amount: float
    total_count: int
    categories: list[CategorySummary]


class MonthOption(BaseModel):
    year: int
    month: int
    count: int


class MonthlyListResponse(BaseModel):
    months: list[MonthOption]
