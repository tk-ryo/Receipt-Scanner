from __future__ import annotations

import datetime

from pydantic import BaseModel


# --- ReceiptItem ---

class ReceiptItemBase(BaseModel):
    name: str | None = None
    quantity: float | None = 1
    price: float | None = None


class ReceiptItemCreate(ReceiptItemBase):
    pass


class ReceiptItemResponse(ReceiptItemBase):
    id: int

    model_config = {"from_attributes": True}


# --- Receipt ---

class ReceiptBase(BaseModel):
    store_name: str | None = None
    date: datetime.date | None = None
    total_amount: float | None = None
    tax: float | None = None
    payment_method: str | None = None
    category: str | None = None


class ReceiptUpdate(ReceiptBase):
    items: list[ReceiptItemCreate] = []


class ReceiptResponse(ReceiptBase):
    id: int
    image_path: str
    thumbnail_path: str | None = None
    items: list[ReceiptItemResponse] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class ReceiptListResponse(BaseModel):
    items: list[ReceiptResponse]
    total: int


# --- Vision API ---

class VisionResponse(ReceiptBase):
    items: list[ReceiptItemCreate] = []
