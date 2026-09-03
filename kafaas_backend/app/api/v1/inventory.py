import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.inventory import (
    VendorInventory,
    VendorProfile,
    InventoryTransaction,
)
from app.models.product import Product
from app.models.user import User, UserRoleEnum
from app.schemas.inventory import (
    VendorInventoryRead,
    StockAdjustmentRequest,
    InventoryTransactionRead,
)
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import require_role
from app.auth.service import log_audit_event

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])


@router.get("/vendor", response_model=List[VendorInventoryRead])
async def get_vendor_inventory(
    current_user: User = Depends(require_role("VENDOR", "ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve assigned warehouse inventory for the authenticated vendor."""
    query = (
        select(VendorInventory)
        .options(selectinload(VendorInventory.product))
    )
    # If vendor, filter by vendor_id
    if current_user.primary_role == UserRoleEnum.VENDOR.value:
        vendor_id = current_user.vendor_profile.id if current_user.vendor_profile else current_user.id
        query = query.where(VendorInventory.vendor_id == vendor_id)

    result = await db.execute(query)
    items = result.scalars().all()

    response = []
    for inv in items:
        prod = inv.product
        response.append(
            VendorInventoryRead(
                id=inv.id,
                vendor_id=inv.vendor_id,
                product_id=inv.product_id,
                product_name=prod.name if prod else "Agrochemical SKU",
                sku=prod.sku if prod else "SKU-UNKNOWN",
                brand=prod.brand if prod else "Bayer",
                pack_size=prod.pack_size if prod else "500 ml",
                main_image=prod.main_image if prod else "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300",
                available_stock=inv.available_stock,
                reserved_stock=inv.reserved_stock,
                total_stock=inv.total_stock,
                low_stock_threshold=inv.low_stock_threshold,
                is_low_stock=inv.is_low_stock,
                warehouse_location=inv.warehouse_location,
                last_restocked_at=inv.last_restocked_at,
                updated_at=inv.updated_at,
            )
        )
    return response


@router.get("/admin", response_model=List[VendorInventoryRead])
async def get_admin_inventory_overview(
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve central stock overview across all regional supplier depots (Admin only)."""
    query = select(VendorInventory).options(selectinload(VendorInventory.product))
    result = await db.execute(query)
    items = result.scalars().all()

    response = []
    for inv in items:
        prod = inv.product
        response.append(
            VendorInventoryRead(
                id=inv.id,
                vendor_id=inv.vendor_id,
                product_id=inv.product_id,
                product_name=prod.name if prod else "Agrochemical SKU",
                sku=prod.sku if prod else "SKU-UNKNOWN",
                brand=prod.brand if prod else "Bayer",
                pack_size=prod.pack_size if prod else "500 ml",
                main_image=prod.main_image if prod else "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300",
                available_stock=inv.available_stock,
                reserved_stock=inv.reserved_stock,
                total_stock=inv.total_stock,
                low_stock_threshold=inv.low_stock_threshold,
                is_low_stock=inv.is_low_stock,
                warehouse_location=inv.warehouse_location,
                last_restocked_at=inv.last_restocked_at,
                updated_at=inv.updated_at,
            )
        )
    return response


@router.post("/adjust", response_model=InventoryTransactionRead)
async def adjust_inventory_stock(
    payload: StockAdjustmentRequest,
    current_user: User = Depends(require_role("VENDOR", "ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """
    Perform restock intake or stock count correction.
    Writes an immutable entry to the inventory audit ledger.
    """
    prod_query = select(Product).where(Product.id == payload.product_id)
    prod_res = await db.execute(prod_query)
    product = prod_res.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    prev_stock = product.stock_quantity
    new_stock = prev_stock
    delta = payload.quantity

    if payload.adjustment_type == "add":
        new_stock = prev_stock + delta
    elif payload.adjustment_type == "subtract":
        new_stock = max(0, prev_stock - delta)
        delta = -(prev_stock - new_stock)
    elif payload.adjustment_type == "set_exact":
        new_stock = payload.quantity
        delta = new_stock - prev_stock

    product.stock_quantity = new_stock
    product.in_stock = new_stock > 0
    product.updated_at = datetime.now(timezone.utc)
    db.add(product)

    # Update VendorInventory if present
    inv_query = select(VendorInventory).where(VendorInventory.product_id == product.id)
    inv_res = await db.execute(inv_query)
    inv_item = inv_res.scalar_one_or_none()
    if inv_item:
        inv_item.available_stock = new_stock
        inv_item.last_restocked_at = datetime.now(timezone.utc)
        inv_item.updated_at = datetime.now(timezone.utc)
        db.add(inv_item)

    tx = InventoryTransaction(
        id=str(uuid.uuid4()),
        product_id=product.id,
        product_name=product.name,
        sku=product.sku,
        vendor_id=product.vendor_id,
        type="adjustment" if payload.adjustment_type != "add" else "restock",
        quantity_change=delta,
        previous_stock=prev_stock,
        new_stock=new_stock,
        reference_id=payload.batch_number,
        reason=payload.reason,
        performed_by_id=current_user.id,
        performed_by_name=current_user.full_name,
        performed_by_role=current_user.primary_role,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(tx)

    await log_audit_event(
        db=db,
        action="INVENTORY_ADJUSTED",
        resource_type="INVENTORY",
        actor_user_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.primary_role,
        resource_id=product.id,
        status_str="SUCCESS",
        details=f"Stock adjusted for {product.name} ({prev_stock} -> {new_stock} units). Batch: {payload.batch_number}",
    )

    await db.commit()
    await db.refresh(tx)
    return InventoryTransactionRead.model_validate(tx)


@router.get("/transactions", response_model=List[InventoryTransactionRead])
async def list_inventory_transactions(
    product_id: Optional[str] = Query(None),
    type_filter: Optional[str] = Query(None, alias="type"),
    current_user: User = Depends(require_role("VENDOR", "ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve immutable chronological transaction audit ledger."""
    query = select(InventoryTransaction).order_by(InventoryTransaction.timestamp.desc())

    if product_id:
        query = query.where(InventoryTransaction.product_id == product_id)
    if type_filter and type_filter != "all":
        query = query.where(InventoryTransaction.type == type_filter)

    result = await db.execute(query)
    return [InventoryTransactionRead.model_validate(t) for t in result.scalars().all()]
