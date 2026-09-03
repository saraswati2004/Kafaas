from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AdminDashboardMetrics(BaseModel):
    total_revenue: float
    total_orders: int
    total_farmers: int
    total_vendors: int
    pending_orders_count: int
    low_stock_products_count: int
    pending_vendor_requests_count: int
    active_recommendations_count: int


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    actor_user_id: Optional[str] = None
    actor_name: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    status: str
    details: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    metadata_json: Dict[str, Any] = {}


class SystemSettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    key: str
    value: str
    description: Optional[str] = None
    updated_at: datetime


class SystemSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None
