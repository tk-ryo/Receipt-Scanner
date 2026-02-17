from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_name = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    total_amount = Column(Float, nullable=True)
    tax = Column(Float, nullable=True)
    payment_method = Column(Text, nullable=True)
    category = Column(Text, nullable=True)
    image_path = Column(Text, nullable=False)
    thumbnail_path = Column(Text, nullable=True)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    items = relationship("ReceiptItem", back_populates="receipt", cascade="all, delete-orphan")


class ReceiptItem(Base):
    __tablename__ = "receipt_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=True)
    quantity = Column(Float, nullable=True, default=1)
    price = Column(Float, nullable=True)

    receipt = relationship("Receipt", back_populates="items")
