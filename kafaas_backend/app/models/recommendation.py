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


class Crop(Base):
    __tablename__ = "crops"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    hindi_name = Column(String(100), nullable=False)
    category = Column(String(100), default="Vegetables", nullable=False)
    image_url = Column(String(500), nullable=False)
    seasons = Column(JSON, default=list, nullable=False)

    diseases = relationship("CropDisease", back_populates="crop", cascade="all, delete-orphan")


class CropDisease(Base):
    __tablename__ = "crop_diseases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), index=True, nullable=False)
    hindi_name = Column(String(150), nullable=False)
    scientific_name = Column(String(200), nullable=False)
    severity = Column(String(50), default="Severe", nullable=False)
    affected_parts = Column(String(150), nullable=False)
    symptoms = Column(JSON, default=list, nullable=False)
    causes = Column(JSON, default=list, nullable=False)
    preventive_measures = Column(JSON, default=list, nullable=False)
    image_url = Column(String(500), nullable=False)

    crop = relationship("Crop", back_populates="diseases")
    recommendations = relationship("DiseaseRecommendation", back_populates="disease", cascade="all, delete-orphan")


class DiseaseRecommendation(Base):
    __tablename__ = "disease_recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    disease_id = Column(String(36), ForeignKey("crop_diseases.id", ondelete="CASCADE"), nullable=False, index=True)
    disease_name = Column(String(150), nullable=False)
    disease_severity = Column(String(50), default="Severe", nullable=False)
    advisory_note = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    disease = relationship("CropDisease", back_populates="recommendations")
    recommended_products = relationship(
        "RecommendedProductItem",
        back_populates="recommendation",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class RecommendedProductItem(Base):
    __tablename__ = "recommended_product_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id = Column(
        String(36),
        ForeignKey("disease_recommendations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    category_name = Column(String(100), nullable=False)
    role = Column(String(100), default="Primary Treatment", nullable=False)
    priority = Column(Integer, default=1, nullable=False)
    reason = Column(Text, nullable=False)
    application_schedule = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    recommendation = relationship("DiseaseRecommendation", back_populates="recommended_products")
    product = relationship("Product", lazy="selectin")


class FarmerScanHistory(Base):
    __tablename__ = "farmer_scan_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scan_code = Column(String(100), unique=True, index=True, nullable=False)
    crop_id = Column(String(36), nullable=False)
    crop_name = Column(String(100), nullable=False)
    disease_id = Column(String(36), nullable=False)
    disease_detected = Column(String(150), nullable=False)
    confidence_score = Column(Float, default=94.5, nullable=False)
    image_url = Column(String(500), nullable=False)
    plot_name = Column(String(150), default="North Plot Sector 4", nullable=False)
    status = Column(String(50), default="Action Required", nullable=False)
    scan_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="scans")
