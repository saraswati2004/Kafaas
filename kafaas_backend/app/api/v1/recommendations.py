import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.recommendation import (
    Crop,
    CropDisease,
    DiseaseRecommendation,
    RecommendedProductItem,
    FarmerScanHistory,
)
from app.models.product import Product
from app.models.user import User
from app.schemas.recommendation import (
    CropRead,
    CropDiseaseRead,
    DiseaseRecommendationRead,
    RecommendationMatrixUpdate,
    FarmerScanHistoryRead,
    FarmerScanCreate,
)
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import require_role
from app.auth.service import log_audit_event

router = APIRouter(tags=["Crop Disease Recommendations & Advisory"])


@router.get("/crops", response_model=List[CropRead])
async def list_crops(
    db: AsyncSession = Depends(get_db),
):
    """Retrieve list of supported agricultural crops and their known pathologies."""
    query = select(Crop).options(selectinload(Crop.diseases)).order_by(Crop.name.asc())
    result = await db.execute(query)
    return [CropRead.model_validate(c) for c in result.scalars().all()]


@router.get("/diseases", response_model=List[CropDiseaseRead])
async def list_diseases(
    crop_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve crop diseases with detailed symptoms, causes, and preventive measures."""
    query = select(CropDisease)
    if crop_id:
        query = query.where(CropDisease.crop_id == crop_id)
    result = await db.execute(query)
    return [CropDiseaseRead.model_validate(d) for d in result.scalars().all()]


@router.get("/recommendations", response_model=List[DiseaseRecommendationRead])
async def list_recommendations(
    crop_name: Optional[str] = Query(None),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve all disease-to-product recommendation mappings and agronomist advisories.
    """
    query = (
        select(DiseaseRecommendation)
        .options(
            selectinload(DiseaseRecommendation.recommended_products).selectinload(RecommendedProductItem.product).selectinload(Product.specifications)
        )
    )
    if active_only:
        query = query.where(DiseaseRecommendation.is_active == True)
    if crop_name:
        query = query.where(DiseaseRecommendation.crop_name.ilike(f"%{crop_name}%"))

    result = await db.execute(query)
    return [DiseaseRecommendationRead.model_validate(r) for r in result.scalars().all()]


@router.get("/recommendations/lookup", response_model=Optional[DiseaseRecommendationRead])
async def lookup_recommendation(
    crop: str = Query(..., description="Crop name (e.g. 'Tomato')"),
    disease: str = Query(..., description="Disease name (e.g. 'Early Blight')"),
    db: AsyncSession = Depends(get_db),
):
    """
    Query recommendation package for a specific crop and diagnosed disease.
    """
    query = (
        select(DiseaseRecommendation)
        .options(
            selectinload(DiseaseRecommendation.recommended_products).selectinload(RecommendedProductItem.product).selectinload(Product.specifications)
        )
        .where(
            DiseaseRecommendation.crop_name.ilike(f"%{crop.strip()}%"),
            DiseaseRecommendation.disease_name.ilike(f"%{disease.strip()}%"),
            DiseaseRecommendation.is_active == True,
        )
    )
    result = await db.execute(query)
    rec = result.scalar_one_or_none()

    if not rec:
        # Return first crop match as fallback advisory
        fallback_query = (
            select(DiseaseRecommendation)
            .options(
                selectinload(DiseaseRecommendation.recommended_products).selectinload(RecommendedProductItem.product).selectinload(Product.specifications)
            )
            .where(DiseaseRecommendation.crop_name.ilike(f"%{crop.strip()}%"))
        )
        rec = (await db.execute(fallback_query)).scalars().first()

    return DiseaseRecommendationRead.model_validate(rec) if rec else None


# --- FARMER SCAN HISTORY ---

@router.get("/farmer/scans", response_model=List[FarmerScanHistoryRead])
async def get_farmer_scan_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve disease diagnostic scan history for the authenticated farmer."""
    query = (
        select(FarmerScanHistory)
        .where(FarmerScanHistory.user_id == current_user.id)
        .order_by(FarmerScanHistory.scan_date.desc())
    )
    result = await db.execute(query)
    return [FarmerScanHistoryRead.model_validate(s) for s in result.scalars().all()]


@router.post("/farmer/scans", response_model=FarmerScanHistoryRead, status_code=status.HTTP_201_CREATED)
async def log_farmer_scan(
    payload: FarmerScanCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Log an on-device AI diagnostic scan result."""
    scan = FarmerScanHistory(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        scan_code=f"SCN-{datetime.now().year}-{str(uuid.uuid4())[:4].upper()}",
        crop_id="crop-1",
        crop_name=payload.crop_name,
        disease_id="dis-1",
        disease_detected=payload.disease_detected,
        confidence_score=payload.confidence_score,
        image_url=payload.image_url,
        plot_name=payload.plot_name or "North Farm Plot",
        status="Action Required",
        scan_date=datetime.now(timezone.utc),
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return FarmerScanHistoryRead.model_validate(scan)


# --- ADMIN MATRIX MANAGEMENT ---

@router.put("/admin/recommendations/{rec_id}", response_model=DiseaseRecommendationRead)
async def update_recommendation_matrix(
    rec_id: str,
    payload: RecommendationMatrixUpdate,
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Update advisory text, severity, and product linkages in the disease matrix (Admin only)."""
    query = (
        select(DiseaseRecommendation)
        .options(
            selectinload(DiseaseRecommendation.recommended_products).selectinload(RecommendedProductItem.product).selectinload(Product.specifications)
        )
        .where(DiseaseRecommendation.id == rec_id)
    )
    result = await db.execute(query)
    rec = result.scalar_one_or_none()

    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation matrix not found.")

    if payload.advisory_note is not None:
        rec.advisory_note = payload.advisory_note
    if payload.disease_severity is not None:
        rec.disease_severity = payload.disease_severity
    if payload.is_active is not None:
        rec.is_active = payload.is_active
    rec.updated_at = datetime.now(timezone.utc)

    if payload.recommended_products is not None:
        # Re-populate attached products
        rec.recommended_products.clear()
        for idx, item in enumerate(payload.recommended_products):
            new_item = RecommendedProductItem(
                id=str(uuid.uuid4()),
                recommendation_id=rec.id,
                product_id=item.product_id,
                category_name=item.category_name,
                role=item.role,
                priority=item.priority or (idx + 1),
                reason=item.reason,
                application_schedule=item.application_schedule,
                is_active=item.is_active,
            )
            rec.recommended_products.append(new_item)

    await log_audit_event(
        db=db,
        action="RECOMMENDATION_MATRIX_UPDATED",
        resource_type="RECOMMENDATION",
        actor_user_id=current_admin.id,
        actor_name=current_admin.full_name,
        actor_role=current_admin.primary_role,
        resource_id=rec.id,
        status_str="SUCCESS",
        details=f"Updated advisory matrix for {rec.crop_name} - {rec.disease_name}",
    )

    await db.commit()
    await db.refresh(rec)
    return DiseaseRecommendationRead.model_validate(rec)
