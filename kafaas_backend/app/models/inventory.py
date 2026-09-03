import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    gstin = Column(String(50), nullable=False)
    license_number = Column(String(100), nullable=False)
    warehouse_address = Column(String(500), nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    bank_account_name = Column(String(255), nullable=True)
    bank_account_number = Column(String(100), nullable=True)
    ifsc_code = Column(String(50), nullable=True)
    approval_status = Column(String(50), default="approved", nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="vendor_profile")
    inventory_items = relationship("VendorInventory", back_populates="vendor", cascade="all, delete-orphan")


class VendorInventory(Base):
    __tablename__ = "vendor_inventories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vendor_id = Column(String(36), ForeignKey("vendor_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    available_stock = Column(Integer, default=0, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=20, nullable=False)
    warehouse_location = Column(String(255), default="Indore Sector B Depot", nullable=False)
    last_restocked_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    vendor = relationship("VendorProfile", back_populates="inventory_items")
    product = relationship("Product", back_populates="vendor_inventory", lazy="selectin")

    @property
    def total_stock(self) -> int:
        return self.available_stock + self.reserved_stock

    @property
    def is_low_stock(self) -> bool:
        return self.available_stock <= self.low_stock_threshold


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=False)
    vendor_id = Column(String(36), nullable=True, index=True)
    type = Column(String(50), nullable=False)  # restock, sale, return, adjustment, cancellation, reservation, release
    quantity_change = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    reference_id = Column(String(100), nullable=True)  # Order # or Batch #
    reason = Column(Text, nullable=False)
    performed_by_id = Column(String(36), nullable=False)
    performed_by_name = Column(String(255), nullable=False)
    performed_by_role = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class VendorChangeRequest(Base):
    __tablename__ = "vendor_change_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vendor_id = Column(String(36), nullable=False, index=True)
    vendor_name = Column(String(255), nullable=False)
    current_data = Column(JSON, nullable=False)
    proposed_data = Column(JSON, nullable=False)
    reason_for_change = Column(Text, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by_id = Column(String(36), nullable=True)
