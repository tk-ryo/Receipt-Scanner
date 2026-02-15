from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.summary import MonthlyListResponse, MonthlySummaryResponse
from app.services.summary_service import get_available_months, get_monthly_summary

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/monthly", response_model=MonthlySummaryResponse)
def monthly_summary(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    """指定年月のカテゴリ別集計を返す。"""
    return get_monthly_summary(db, year, month)


@router.get("/monthly-list", response_model=MonthlyListResponse)
def monthly_list(db: Session = Depends(get_db)):
    """レシートが存在する年月リストを返す。"""
    return get_available_months(db)
