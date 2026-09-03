from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.product import ProductRead


class CropDiseaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    crop_id: str
    name: str
    hindi_name: str
    scientific_name: str
    severity: str
    affected_parts: str
    symptoms: List[str]
    causes: List[str]
    preventive_measures: List[str]
    image_url: str


class CropRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    hindi_name: str
    category: str
    image_url: str
    seasons: List[str]
    diseases: List[CropDiseaseRead] = []


class RecommendedProductItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    recommendation_id: str
    product_id: str
    category_name: str
    role: str
    priority: int
    reason: str
    application_schedule: str
    is_active: bool
    product: Optional[ProductRead] = None


class RecommendedProductItemCreate(BaseModel):
    product_id: str
    category_name: str
    role: str
    priority: int = 1
    reason: str
    application_schedule: str
    is_active: bool = True


class DiseaseRecommendationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    crop_id: str
    crop_name: str
    disease_id: str
    disease_name: str
    disease_severity: str
    advisory_note: str
    is_active: bool
    recommended_products: List[RecommendedProductItemRead] = []
    created_at: datetime
    updated_at: datetime


class RecommendationMatrixUpdate(BaseModel):
    advisory_note: Optional[str] = None
    disease_severity: Optional[str] = None
    is_active: Optional[bool] = None
    recommended_products: Optional[List[RecommendedProductItemCreate]] = None


class FarmerScanHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    scan_code: str
    crop_id: str
    crop_name: str
    disease_id: str
    disease_detected: str
    confidence_score: float
    image_url: str
    plot_name: str
    status: str
    scan_date: datetime


class FarmerScanCreate(BaseModel):
    crop_name: str
    disease_detected: str
    confidence_score: float = Field(..., ge=0, le=100)
    image_url: str
    plot_name: Optional[str] = "Farm Plot Sector 1"
