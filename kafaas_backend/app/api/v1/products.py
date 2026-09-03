import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.product import Product, Category, ProductSpecification
from app.models.user import User
from app.schemas.product import (
    ProductRead,
    ProductCreate,
    ProductUpdate,
    PaginatedProducts,
)
from app.auth.permissions import require_role
from app.auth.service import log_audit_event

router = APIRouter(prefix="/products", tags=["Products Catalog"])
admin_products_router = APIRouter(prefix="/admin/products", tags=["Admin Products"])


@router.get("", response_model=PaginatedProducts)
async def list_products(
    search: Optional[str] = Query(None, description="Search by name, brand, technical name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    crop: Optional[str] = Query(None, description="Filter by target crop"),
    form: Optional[str] = Query(None, description="Liquid, Granules, Powder, etc."),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    is_organic: Optional[bool] = Query(None),
    in_stock_only: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("featured", description="'featured', 'price_low_high', 'price_high_low', 'rating', 'newest'"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Public catalog browser with full faceted filtering, search, and pagination.
    """
    query = select(Product).options(selectinload(Product.specifications))

    # Apply search filter
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.outerjoin(Product.specifications).where(
            or_(
                func.lower(Product.name).like(term),
                func.lower(Product.brand).like(term),
                func.lower(Product.category_name).like(term),
                func.lower(ProductSpecification.technical_name).like(term),
            )
        )

    # Apply category filter
    if category and category.lower() != "all":
        query = query.where(func.lower(Product.category_name) == category.lower())

    # Apply form filter
    if form:
        query = query.where(func.lower(Product.form) == form.lower())

    # Apply price range
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Apply organic filter
    if is_organic is not None:
        query = query.where(Product.is_organic == is_organic)

    # Apply in-stock filter
    if in_stock_only:
        query = query.where(Product.in_stock == True)

    # Count total matching records
    count_query = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_query)).scalar_one()

    # Apply sorting
    if sort_by == "price_low_high":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_high_low":
        query = query.order_by(Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:  # featured / default
        query = query.order_by(Product.rating.desc(), Product.created_at.desc())

    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    items = result.scalars().all()

    # Filter target crop in memory if provided
    if crop:
        filtered_items = []
        for p in items:
            if p.specifications and any(crop.lower() in c.lower() for c in p.specifications.target_crops):
                filtered_items.append(p)
        items = filtered_items

    total_pages = max(1, (total_count + limit - 1) // limit)

    return PaginatedProducts(
        items=[ProductRead.model_validate(p) for p in items],
        total=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get("/featured", response_model=List[ProductRead])
async def get_featured_products(
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve top-rated and featured agricultural inputs."""
    query = (
        select(Product)
        .options(selectinload(Product.specifications))
        .where(Product.status == "active")
        .order_by(Product.rating.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    return [ProductRead.model_validate(p) for p in result.scalars().all()]


@router.get("/{product_id}", response_model=ProductRead)
async def get_product_detail(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve single product details with technical formulation and dosage specifications."""
    query = (
        select(Product)
        .options(selectinload(Product.specifications))
        .where((Product.id == product_id) | (Product.sku == product_id))
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    return ProductRead.model_validate(product)


@router.get("/{product_id}/related", response_model=List[ProductRead])
async def get_related_products(
    product_id: str,
    limit: int = Query(4, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Find complementary or related products within the same category."""
    query = select(Product).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    related_query = (
        select(Product)
        .options(selectinload(Product.specifications))
        .where(Product.category_name == product.category_name, Product.id != product.id)
        .limit(limit)
    )
    related_res = await db.execute(related_query)
    return [ProductRead.model_validate(p) for p in related_res.scalars().all()]


# --- ADMINISTRATIVE PRODUCT CRUD (ADMIN ROLE REQUIRED) ---

@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new agricultural product listing.
    Security rule: Strictly restricted to ADMIN. Vendors cannot create global products.
    """
    # Check if SKU exists
    existing_sku = await db.execute(select(Product).where(Product.sku == payload.sku))
    if existing_sku.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{payload.sku}' already exists.",
        )

    product_id = str(uuid.uuid4())
    short_desc = payload.short_description or payload.description[:120]
    orig_price = payload.original_price or round(payload.price * 1.15, 2)
    discount_pct = payload.discount_percentage or max(0, int(((orig_price - payload.price) / orig_price) * 100))

    new_product = Product(
        id=product_id,
        name=payload.name,
        brand=payload.brand,
        category_name=payload.category_name,
        sku=payload.sku,
        description=payload.description,
        short_description=short_desc,
        price=payload.price,
        original_price=orig_price,
        discount_percentage=discount_pct,
        images=payload.images or [payload.main_image],
        main_image=payload.main_image,
        pack_size=payload.pack_size,
        form=payload.form,
        in_stock=payload.stock_quantity > 0,
        stock_quantity=payload.stock_quantity,
        status=payload.status,
        is_organic=payload.is_organic,
        recommended_for_diseases=payload.recommended_for_diseases or [],
        benefits=payload.benefits or [],
        usage_instructions=payload.usage_instructions or [],
        safety_precautions=payload.safety_precautions or [],
    )
    db.add(new_product)

    if payload.specifications:
        specs = ProductSpecification(
            id=str(uuid.uuid4()),
            product_id=product_id,
            technical_name=payload.specifications.technical_name,
            chemical_formula=payload.specifications.chemical_formula,
            formulation=payload.specifications.formulation,
            dosage_per_acre=payload.specifications.dosage_per_acre,
            dosage_per_liter=payload.specifications.dosage_per_liter,
            target_crops=payload.specifications.target_crops,
            target_pests_and_diseases=payload.specifications.target_pests_and_diseases,
            application_method=payload.specifications.application_method,
            waiting_period_days=payload.specifications.waiting_period_days,
            toxicity_class=payload.specifications.toxicity_class,
            manufacturer=payload.specifications.manufacturer,
            country_of_origin=payload.specifications.country_of_origin,
            shelf_life_months=payload.specifications.shelf_life_months,
        )
        db.add(specs)

    await log_audit_event(
        db=db,
        action="PRODUCT_CREATED",
        resource_type="PRODUCT",
        actor_user_id=current_admin.id,
        actor_name=current_admin.full_name,
        actor_role=current_admin.primary_role,
        resource_id=product_id,
        status_str="SUCCESS",
        details=f"Created product {payload.name} (SKU: {payload.sku})",
    )

    await db.commit()
    await db.refresh(new_product)
    return ProductRead.model_validate(new_product)


@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: str,
    payload: ProductUpdate,
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Update an agricultural product listing and its technical specifications."""
    query = (
        select(Product)
        .options(selectinload(Product.specifications))
        .where(Product.id == product_id)
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    for field, value in payload.model_dump(exclude_unset=True, exclude={"specifications"}).items():
        setattr(product, field, value)

    if payload.stock_quantity is not None:
        product.in_stock = payload.stock_quantity > 0

    if payload.specifications:
        if not product.specifications:
            product.specifications = ProductSpecification(
                id=str(uuid.uuid4()),
                product_id=product.id,
                technical_name=payload.specifications.technical_name,
                formulation=payload.specifications.formulation,
                dosage_per_acre=payload.specifications.dosage_per_acre,
                dosage_per_liter=payload.specifications.dosage_per_liter,
                target_crops=payload.specifications.target_crops,
                target_pests_and_diseases=payload.specifications.target_pests_and_diseases,
                application_method=payload.specifications.application_method,
                waiting_period_days=payload.specifications.waiting_period_days,
                toxicity_class=payload.specifications.toxicity_class,
                manufacturer=payload.specifications.manufacturer,
                country_of_origin=payload.specifications.country_of_origin,
                shelf_life_months=payload.specifications.shelf_life_months,
            )
            db.add(product.specifications)
        else:
            for s_field, s_val in payload.specifications.model_dump(exclude_unset=True).items():
                setattr(product.specifications, s_field, s_val)

    await log_audit_event(
        db=db,
        action="PRODUCT_UPDATED",
        resource_type="PRODUCT",
        actor_user_id=current_admin.id,
        actor_name=current_admin.full_name,
        actor_role=current_admin.primary_role,
        resource_id=product.id,
        status_str="SUCCESS",
        details=f"Updated product {product.name}",
    )

    await db.commit()
    await db.refresh(product)
    return ProductRead.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Delete a product listing."""
    query = select(Product).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    await log_audit_event(
        db=db,
        action="PRODUCT_DELETED",
        resource_type="PRODUCT",
        actor_user_id=current_admin.id,
        actor_name=current_admin.full_name,
        actor_role=current_admin.primary_role,
        resource_id=product.id,
        status_str="SUCCESS",
        details=f"Deleted product {product.name} (SKU: {product.sku})",
    )

    await db.delete(product)
    await db.commit()
    return None


# Admin aliases for direct frontend compatibility
@admin_products_router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def admin_create_product_alias(
    payload: ProductCreate,
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    return await create_product(payload, current_admin, db)


@admin_products_router.put("/{product_id}", response_model=ProductRead)
async def admin_update_product_alias(
    product_id: str,
    payload: ProductUpdate,
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    return await update_product(product_id, payload, current_admin, db)


@admin_products_router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_product_alias(
    product_id: str,
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    return await delete_product(product_id, current_admin, db)

