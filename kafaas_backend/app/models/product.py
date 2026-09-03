import uuid
from datetime import datetime, timezone
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


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="Sprout", nullable=False)
    image_url = Column(String(500), nullable=True)
    product_count = Column(Integer, default=0, nullable=False)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    brand = Column(String(150), index=True, nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    category_name = Column(String(100), index=True, nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=False)
    
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=False)
    discount_percentage = Column(Integer, default=0, nullable=False)
    
    images = Column(JSON, default=list, nullable=False)
    main_image = Column(String(500), nullable=False)
    pack_size = Column(String(100), nullable=False)
    form = Column(String(100), nullable=False)
    
    in_stock = Column(Boolean, default=True, nullable=False)
    stock_quantity = Column(Integer, default=100, nullable=False)
    status = Column(String(50), default="active", nullable=False)
    
    rating = Column(Float, default=4.8, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    is_organic = Column(Boolean, default=False, nullable=False)
    
    recommended_for_diseases = Column(JSON, default=list, nullable=False)
    benefits = Column(JSON, default=list, nullable=False)
    usage_instructions = Column(JSON, default=list, nullable=False)
    safety_precautions = Column(JSON, default=list, nullable=False)
    
    vendor_id = Column(String(36), nullable=True)
    vendor_name = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    category = relationship("Category", back_populates="products")
    specifications = relationship("ProductSpecification", back_populates="product", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    vendor_inventory = relationship("VendorInventory", back_populates="product", cascade="all, delete-orphan")


class ProductSpecification(Base):
    __tablename__ = "product_specifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    technical_name = Column(String(255), nullable=False)
    chemical_formula = Column(String(255), nullable=True)
    formulation = Column(String(150), nullable=False)
    dosage_per_acre = Column(String(150), nullable=False)
    dosage_per_liter = Column(String(150), nullable=False)
    target_crops = Column(JSON, default=list, nullable=False)
    target_pests_and_diseases = Column(JSON, default=list, nullable=False)
    application_method = Column(String(255), nullable=False)
    waiting_period_days = Column(Integer, default=14, nullable=False)
    toxicity_class = Column(String(100), default="Blue (Moderate)", nullable=False)
    manufacturer = Column(String(255), nullable=False)
    country_of_origin = Column(String(100), default="India", nullable=False)
    shelf_life_months = Column(Integer, default=24, nullable=False)

    product = relationship("Product", back_populates="specifications")
