from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon_name: str
    image_url: Optional[str] = None
    product_count: int = 0


class ProductSpecificationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    technical_name: str
    chemical_formula: Optional[str] = None
    formulation: str
    dosage_per_acre: str
    dosage_per_liter: str
    target_crops: List[str] = []
    target_pests_and_diseases: List[str] = []
    application_method: str = "Foliar Spray"
    waiting_period_days: int = 14
    toxicity_class: str = "Blue (Moderate)"
    manufacturer: str
    country_of_origin: str = "India"
    shelf_life_months: int = 24


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    brand: str
    category_id: Optional[str] = None
    category_name: str
    sku: str
    description: str
    short_description: str
    price: float
    original_price: float
    discount_percentage: int
    images: List[str] = []
    main_image: str
    pack_size: str
    form: str
    in_stock: bool
    stock_quantity: int
    status: str
    rating: float
    review_count: int
    is_organic: bool
    recommended_for_diseases: List[str] = []
    benefits: List[str] = []
    usage_instructions: List[str] = []
    safety_precautions: List[str] = []
    specifications: Optional[ProductSpecificationSchema] = None
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2)
    brand: str = Field(..., min_length=2)
    category_name: str
    sku: str
    description: str
    short_description: Optional[str] = None
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = 0
    images: Optional[List[str]] = []
    main_image: str
    pack_size: str
    form: str
    stock_quantity: int = 100
    status: str = "active"
    is_organic: bool = False
    recommended_for_diseases: Optional[List[str]] = []
    benefits: Optional[List[str]] = []
    usage_instructions: Optional[List[str]] = []
    safety_precautions: Optional[List[str]] = []
    specifications: Optional[ProductSpecificationSchema] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category_name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = None
    images: Optional[List[str]] = None
    main_image: Optional[str] = None
    pack_size: Optional[str] = None
    form: Optional[str] = None
    stock_quantity: Optional[int] = None
    status: Optional[str] = None
    is_organic: Optional[bool] = None
    recommended_for_diseases: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    usage_instructions: Optional[List[str]] = None
    safety_precautions: Optional[List[str]] = None
    specifications: Optional[ProductSpecificationSchema] = None


class PaginatedProducts(BaseModel):
    items: List[ProductRead]
    total: int
    page: int
    limit: int
    total_pages: int
