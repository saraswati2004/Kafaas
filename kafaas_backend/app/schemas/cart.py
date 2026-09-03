from typing import List, Optional
from pydantic import BaseModel, Field


class CartItemSchema(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class CartCalculationRequest(BaseModel):
    items: List[CartItemSchema] = []
    kisan_subsidy_applied: bool = True


class CalculatedCartItem(BaseModel):
    product_id: str
    product_name: str
    brand: str
    category: str
    image: str
    pack_size: str
    unit_price: float
    quantity: int
    total_price: float
    sku: str
    in_stock: bool
    available_stock: int


class CartPricingResponse(BaseModel):
    items: List[CalculatedCartItem]
    subtotal: float
    discount: float
    farmer_subsidy_discount: float
    delivery_charge: float
    tax_gst: float
    total_amount: float
    free_delivery_threshold: float = 999.0
    eligible_for_subsidy: bool
    all_items_in_stock: bool
