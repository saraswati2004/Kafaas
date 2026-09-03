import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=False)
    
    shipping_address = Column(JSON, nullable=False)
    pricing = Column(JSON, nullable=False)  # subtotal, discount, subsidy, delivery, gst, total
    
    status = Column(String(50), default="pending", nullable=False)  # pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled
    payment_status = Column(String(50), default="pending", nullable=False)  # pending, paid, failed, refunded
    payment_method = Column(String(50), default="upi", nullable=False)  # upi, card, netbanking, cod
    payment_transaction_id = Column(String(100), nullable=True)
    
    cancellation_allowed = Column(Boolean, default=True, nullable=False)
    cancel_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    vendor_id = Column(String(36), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    estimated_delivery_date = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc) + timedelta(days=3),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin")
    timeline = relationship("OrderTrackingEvent", back_populates="order", cascade="all, delete-orphan", lazy="selectin", order_by="OrderTrackingEvent.timestamp")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), nullable=False)
    product_name = Column(String(255), nullable=False)
    brand = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    image = Column(String(500), nullable=False)
    pack_size = Column(String(100), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    sku = Column(String(100), nullable=False)
    vendor_id = Column(String(36), nullable=True)
    vendor_name = Column(String(255), nullable=True)

    order = relationship("Order", back_populates="items")


class OrderTrackingEvent(Base):
    __tablename__ = "order_tracking_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(150), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="timeline")
