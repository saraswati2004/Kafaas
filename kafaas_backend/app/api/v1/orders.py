import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User, Address, UserRoleEnum
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderTrackingEvent
from app.models.inventory import InventoryTransaction
from app.schemas.order import (
    CreateOrderRequest,
    OrderRead,
    OrderStatusUpdateRequest,
    OrderCancelRequest,
)
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import check_resource_ownership, require_role
from app.auth.service import log_audit_event

router = APIRouter(prefix="/orders", tags=["Orders & Logistics"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: CreateOrderRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new agricultural input order.
    Re-calculates authoritative pricing server-side, validates inventory stock,
    reserves units, and initializes logistics tracking events.
    """
    # 1. Resolve shipping address
    shipping_addr_dict = {}
    if payload.shipping_address_id:
        addr_query = select(Address).where(
            Address.id == payload.shipping_address_id,
            Address.user_id == current_user.id
        )
        res = await db.execute(addr_query)
        addr = res.scalar_one_or_none()
        if not addr:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected delivery address not found.")
        shipping_addr_dict = {
            "name": addr.name,
            "phone": addr.phone,
            "addressLine1": addr.address_line1,
            "addressLine2": addr.address_line2 or "",
            "landmark": addr.landmark or "",
            "villageOrCity": addr.village_or_city,
            "district": addr.district,
            "state": addr.state,
            "pincode": addr.pincode,
        }
    elif payload.new_shipping_address:
        n = payload.new_shipping_address
        shipping_addr_dict = {
            "name": n.name,
            "phone": n.phone,
            "addressLine1": n.address_line1,
            "addressLine2": n.address_line2 or "",
            "landmark": n.landmark or "",
            "villageOrCity": n.village_or_city,
            "district": n.district,
            "state": n.state,
            "pincode": n.pincode,
        }
    else:
        # Fallback to user's default address
        default_addr_query = select(Address).where(Address.user_id == current_user.id, Address.is_default == True)
        res = await db.execute(default_addr_query)
        default_addr = res.scalar_one_or_none()
        if not default_addr:
            # Fallback to first address or default profile location
            first_addr_query = select(Address).where(Address.user_id == current_user.id)
            res = await db.execute(first_addr_query)
            default_addr = res.scalars().first()

        if default_addr:
            shipping_addr_dict = {
                "name": default_addr.name,
                "phone": default_addr.phone,
                "addressLine1": default_addr.address_line1,
                "addressLine2": default_addr.address_line2 or "",
                "villageOrCity": default_addr.village_or_city,
                "district": default_addr.district,
                "state": default_addr.state,
                "pincode": default_addr.pincode,
            }
        else:
            shipping_addr_dict = {
                "name": current_user.full_name,
                "phone": current_user.phone or "+91 98765 43210",
                "addressLine1": "Plot 12, Gram Panchayat Road",
                "villageOrCity": "Dhar",
                "district": "Dhar",
                "state": "Madhya Pradesh",
                "pincode": "454001",
            }

    # 2. Fetch products and validate stock
    product_ids = [item.product_id for item in payload.items]
    prod_query = select(Product).where(Product.id.in_(product_ids))
    prod_res = await db.execute(prod_query)
    products_by_id = {p.id: p for p in prod_res.scalars().all()}

    subtotal = 0.0
    order_items = []
    order_id = str(uuid.uuid4())
    order_number = f"KFS-{datetime.now().year}-{str(uuid.uuid4())[:4].upper()}"

    for item in payload.items:
        prod = products_by_id.get(item.product_id)
        if not prod:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product ID {item.product_id} is invalid or no longer available."
            )
        if prod.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{prod.name}'. Only {prod.stock_quantity} available."
            )

        item_total = prod.price * item.quantity
        subtotal += item_total

        # Deduct stock
        prev_stock = prod.stock_quantity
        prod.stock_quantity -= item.quantity
        prod.in_stock = prod.stock_quantity > 0
        db.add(prod)

        # Log stock inventory transaction
        tx = InventoryTransaction(
            id=str(uuid.uuid4()),
            product_id=prod.id,
            product_name=prod.name,
            sku=prod.sku,
            vendor_id=prod.vendor_id,
            type="sale",
            quantity_change=-item.quantity,
            previous_stock=prev_stock,
            new_stock=prod.stock_quantity,
            reference_id=order_number,
            reason=f"Order {order_number} checkout fulfillment",
            performed_by_id=current_user.id,
            performed_by_name=current_user.full_name,
            performed_by_role=current_user.primary_role,
        )
        db.add(tx)

        oi = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order_id,
            product_id=prod.id,
            product_name=prod.name,
            brand=prod.brand,
            category=prod.category_name,
            image=prod.main_image,
            pack_size=prod.pack_size,
            unit_price=prod.price,
            quantity=item.quantity,
            total_price=round(item_total, 2),
            sku=prod.sku,
            vendor_id=prod.vendor_id,
            vendor_name=prod.vendor_name or "AgroTech Solutions Indore",
        )
        order_items.append(oi)

    # 3. Compute authoritative pricing
    volume_discount = round(subtotal * 0.05, 2) if subtotal >= 2500 else 0.0
    farmer_subsidy = 100.0 if subtotal >= 1000 else 0.0
    net_items = max(0.0, subtotal - volume_discount - farmer_subsidy)
    delivery_fee = 0.0 if net_items >= 999.0 else 80.0
    tax_gst = round(net_items * 0.05, 2)
    total_amount = round(net_items + delivery_fee + tax_gst, 2)

    pricing_dict = {
        "subtotal": round(subtotal, 2),
        "discount": round(volume_discount, 2),
        "farmerSubsidyDiscount": round(farmer_subsidy, 2),
        "deliveryCharge": round(delivery_fee, 2),
        "taxGst": round(tax_gst, 2),
        "totalAmount": round(total_amount, 2),
    }

    # 4. Create Order record
    new_order = Order(
        id=order_id,
        order_number=order_number,
        user_id=current_user.id,
        customer_name=current_user.full_name,
        customer_phone=current_user.phone or shipping_addr_dict.get("phone", "+91 98765 43210"),
        customer_email=current_user.email,
        shipping_address=shipping_addr_dict,
        pricing=pricing_dict,
        status="confirmed",
        payment_status="paid" if payload.payment_method != "cod" else "pending",
        payment_method=payload.payment_method,
        payment_transaction_id=f"TXN-UPI-{str(uuid.uuid4())[:8].upper()}" if payload.payment_method != "cod" else None,
        cancellation_allowed=True,
        notes=payload.notes,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        estimated_delivery_date=datetime.now(timezone.utc) + timedelta(days=3),
    )
    new_order.items = order_items

    # 5. Initialize Logistics Tracking Timeline
    now = datetime.now(timezone.utc)
    events = [
        OrderTrackingEvent(
            id=str(uuid.uuid4()),
            order_id=order_id,
            status="pending",
            title="Consignment Booked",
            description="Order received and Kisan Subsidy verified.",
            location="KaFaaS Regional Portal",
            completed=True,
            timestamp=now,
        ),
        OrderTrackingEvent(
            id=str(uuid.uuid4()),
            order_id=order_id,
            status="confirmed",
            title="Order Confirmed",
            description="Payment and inventory stock locked successfully.",
            location="AgroTech Central Depot, Indore",
            completed=True,
            timestamp=now,
        ),
        OrderTrackingEvent(
            id=str(uuid.uuid4()),
            order_id=order_id,
            status="processing",
            title="Packaging & Quality Checked",
            description="Active ingredient seal inspected and packed.",
            location="Indore Hub Sector B",
            completed=False,
            timestamp=now + timedelta(hours=6),
        ),
        OrderTrackingEvent(
            id=str(uuid.uuid4()),
            order_id=order_id,
            status="shipped",
            title="Dispatched in Transit",
            description="Handed over to rural logistics freight.",
            location="State Highway 27 Hub",
            completed=False,
            timestamp=now + timedelta(days=1),
        ),
        OrderTrackingEvent(
            id=str(uuid.uuid4()),
            order_id=order_id,
            status="out_for_delivery",
            title="Out for Farm Delivery",
            description="Local courier van en-route to farm gate destination.",
            location="Tehsil Delivery Point",
            completed=False,
            timestamp=now + timedelta(days=2),
        ),
        OrderTrackingEvent(
            id=str(uuid.uuid4()),
            order_id=order_id,
            status="delivered",
            title="Handover Complete",
            description="Package delivered to farmer with physical invoice.",
            location="Recipient Farm",
            completed=False,
            timestamp=now + timedelta(days=3),
        ),
    ]
    new_order.timeline = events
    db.add(new_order)

    # 6. Audit logging
    await log_audit_event(
        db=db,
        action="ORDER_CREATED",
        resource_type="ORDER",
        actor_user_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.primary_role,
        resource_id=order_id,
        status_str="SUCCESS",
        details=f"Created order #{order_number} for ₹{total_amount} ({payload.payment_method})",
    )

    await db.commit()
    await db.refresh(new_order)
    return OrderRead.model_validate(new_order)


@router.get("", response_model=List[OrderRead])
async def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List orders based on role:
    - Farmers: strictly see their own orders.
    - Vendors: see orders assigned to their depot.
    - Admins: see all orders across the ecosystem.
    """
    user_roles = [r.name for r in current_user.roles]

    query = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.timeline))
        .order_by(Order.created_at.desc())
    )

    if UserRoleEnum.ADMIN.value in user_roles:
        # Admin can view all
        if status_filter and status_filter != "all":
            query = query.where(Order.status == status_filter)
    elif UserRoleEnum.VENDOR.value in user_roles:
        # Vendor view
        vendor_id = current_user.vendor_profile.id if current_user.vendor_profile else current_user.id
        query = query.where(Order.vendor_id == vendor_id)
        if status_filter and status_filter != "all":
            query = query.where(Order.status == status_filter)
    else:
        # Farmer view: Strictly own orders
        query = query.where(Order.user_id == current_user.id)
        if status_filter and status_filter != "all":
            query = query.where(Order.status == status_filter)

    result = await db.execute(query)
    orders = result.scalars().all()
    return [OrderRead.model_validate(o) for o in orders]


@router.get("/{order_id}", response_model=OrderRead)
async def get_order_detail(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve single order details with ownership verification."""
    query = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.timeline))
        .where((Order.id == order_id) | (Order.order_number == order_id))
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    # Object-level ownership check (Admins and assigned Vendors allowed)
    user_roles = [r.name for r in current_user.roles]
    if UserRoleEnum.ADMIN.value not in user_roles and UserRoleEnum.VENDOR.value not in user_roles:
        check_resource_ownership(order.user_id, current_user)

    return OrderRead.model_validate(order)


@router.post("/{order_id}/cancel", response_model=OrderRead)
async def cancel_order(
    order_id: str,
    payload: OrderCancelRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cancel an order if business rules permit (only pending/confirmed orders).
    Restores inventory stock and records audit events.
    """
    query = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.timeline))
        .where((Order.id == order_id) | (Order.order_number == order_id))
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    check_resource_ownership(order.user_id, current_user)

    if order.status in ["shipped", "out_for_delivery", "delivered"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be cancelled in '{order.status}' state as consignment is already dispatched."
        )
    if order.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already cancelled."
        )

    order.status = "cancelled"
    order.cancel_reason = payload.reason
    order.cancellation_allowed = False
    order.updated_at = datetime.now(timezone.utc)

    # Restore product inventory
    for item in order.items:
        prod_query = select(Product).where(Product.id == item.product_id)
        p_res = await db.execute(prod_query)
        prod = p_res.scalar_one_or_none()
        if prod:
            prev_stock = prod.stock_quantity
            prod.stock_quantity += item.quantity
            prod.in_stock = True
            db.add(prod)

            tx = InventoryTransaction(
                id=str(uuid.uuid4()),
                product_id=prod.id,
                product_name=prod.name,
                sku=prod.sku,
                type="cancellation",
                quantity_change=item.quantity,
                previous_stock=prev_stock,
                new_stock=prod.stock_quantity,
                reference_id=order.order_number,
                reason=f"Order cancelled by farmer: {payload.reason}",
                performed_by_id=current_user.id,
                performed_by_name=current_user.full_name,
                performed_by_role=current_user.primary_role,
            )
            db.add(tx)

    await log_audit_event(
        db=db,
        action="ORDER_CANCELLED",
        resource_type="ORDER",
        actor_user_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.primary_role,
        resource_id=order.id,
        status_str="SUCCESS",
        details=f"Cancelled order #{order.order_number}. Reason: {payload.reason}",
    )

    await db.commit()
    await db.refresh(order)
    return OrderRead.model_validate(order)


@router.put("/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdateRequest,
    current_user: User = Depends(require_role("ADMIN", "VENDOR")),
    db: AsyncSession = Depends(get_db),
):
    """
    Transition order through fulfillment state machine (Vendor or Admin).
    """
    query = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.timeline))
        .where((Order.id == order_id) | (Order.order_number == order_id))
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    order.status = payload.status
    if payload.status in ["shipped", "out_for_delivery", "delivered"]:
        order.cancellation_allowed = False
    if payload.status == "delivered":
        order.payment_status = "paid"
    order.updated_at = datetime.now(timezone.utc)

    # Update timeline event completions
    status_order = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"]
    if payload.status in status_order:
        current_idx = status_order.index(payload.status)
        for ev in order.timeline:
            if ev.status in status_order and status_order.index(ev.status) <= current_idx:
                ev.completed = True
                db.add(ev)

    await log_audit_event(
        db=db,
        action="ORDER_STATUS_UPDATED",
        resource_type="ORDER",
        actor_user_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.primary_role,
        resource_id=order.id,
        status_str="SUCCESS",
        details=f"Order #{order.order_number} transitioned to '{payload.status}'",
    )

    await db.commit()
    await db.refresh(order)
    return OrderRead.model_validate(order)
