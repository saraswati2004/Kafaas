from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import AddressBase, AddressRead


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
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
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None


class OrderTrackingEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    status: str
    title: str
    description: str
    location: Optional[str] = None
    completed: bool
    timestamp: datetime


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_number: str
    user_id: str
    customer_name: str
    customer_phone: str
    customer_email: str
    shipping_address: Dict[str, Any]
    pricing: Dict[str, Any]
    status: str
    payment_status: str
    payment_method: str
    payment_transaction_id: Optional[str] = None
    cancellation_allowed: bool
    cancel_reason: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemRead] = []
    timeline: List[OrderTrackingEventRead] = []
    created_at: datetime
    updated_at: datetime
    estimated_delivery_date: datetime


class CreateOrderItem(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class CreateOrderRequest(BaseModel):
    items: List[CreateOrderItem] = Field(..., min_length=1)
    shipping_address_id: Optional[str] = None
    new_shipping_address: Optional[AddressBase] = None
    payment_method: str = Field("upi", description="'upi', 'card', 'netbanking', 'cod'")
    notes: Optional[str] = None


class OrderStatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


class OrderCancelRequest(BaseModel):
    reason: str = Field(..., min_length=3)
