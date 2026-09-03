from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class AddressBase(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=8, max_length=20)
    alternate_phone: Optional[str] = None
    address_line1: str = Field(..., min_length=3)
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    village_or_city: str
    district: str
    state: str
    pincode: str = Field(..., min_length=5, max_length=10)
    is_default: bool = False
    address_type: str = "farm"


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    village_or_city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_default: Optional[bool] = None
    address_type: Optional[str] = None


class AddressRead(AddressBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str


class UserPreferenceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    language: str
    notifications_enabled: bool
    preferred_crops: List[str]


class UserPreferenceUpdate(BaseModel):
    language: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    preferred_crops: Optional[List[str]] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    kisan_id: Optional[str] = None


class UserDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    auth_user_id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    kisan_id: Optional[str] = None
    status: str
    role: str
    permissions: List[str] = []
    addresses: List[AddressRead] = []
    preferences: Optional[UserPreferenceRead] = None
    created_at: datetime
