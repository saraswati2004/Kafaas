from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class VendorProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    business_name: str
    contact_person: str
    phone: str
    email: str
    gstin: str
    license_number: str
    warehouse_address: str
    state: str
    district: str
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    approval_status: str


class VendorInventoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    vendor_id: str
    product_id: str
    product_name: str
    sku: str
    brand: str
    pack_size: str
    main_image: str
    available_stock: int
    reserved_stock: int
    total_stock: int
    low_stock_threshold: int
    is_low_stock: bool
    warehouse_location: str
    last_restocked_at: datetime
    updated_at: datetime


class StockAdjustmentRequest(BaseModel):
    product_id: str
    adjustment_type: str = Field(..., description="'add', 'subtract', or 'set_exact'")
    quantity: int = Field(..., gt=0)
    batch_number: str = Field(..., min_length=2)
    reason: str = Field(..., min_length=3)


class InventoryTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: str
    sku: str
    vendor_id: Optional[str] = None
    type: str
    quantity_change: int
    previous_stock: int
    new_stock: int
    reference_id: Optional[str] = None
    reason: str
    performed_by_id: str
    performed_by_name: str
    performed_by_role: str
    timestamp: datetime


class VendorChangeRequestCreate(BaseModel):
    vendor_id: str
    vendor_name: str
    current_data: Dict[str, Any]
    proposed_data: Dict[str, Any]
    reason_for_change: str = Field(..., min_length=5)


class VendorChangeRequestReview(BaseModel):
    action: str = Field(..., description="'approved' or 'rejected'")
    rejection_reason: Optional[str] = None


class VendorChangeRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    vendor_id: str
    vendor_name: str
    current_data: Dict[str, Any]
    proposed_data: Dict[str, Any]
    reason_for_change: str
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None


class VendorMetricsRead(BaseModel):
    total_sales: float
    total_orders: int
    pending_fulfillment: int
    low_stock_items_count: int
    fulfillment_rate_percentage: float
    monthly_revenue: List[Dict[str, Any]] = []
