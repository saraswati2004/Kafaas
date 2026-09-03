from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.product import Product
from app.schemas.cart import (
    CartCalculationRequest,
    CartPricingResponse,
    CalculatedCartItem,
)

router = APIRouter(prefix="/cart", tags=["Cart & Pricing"])


@router.post("/calculate", response_model=CartPricingResponse)
async def calculate_cart_totals(
    payload: CartCalculationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authoritative backend pricing calculation.
    Computes real volume discounts, Kisan subsidies, freight logistics fees, and 5% agrochemical GST.
    Guarantees that the client cannot manipulate prices.
    """
    if not payload.items:
        return CartPricingResponse(
            items=[],
            subtotal=0.0,
            discount=0.0,
            farmer_subsidy_discount=0.0,
            delivery_charge=0.0,
            tax_gst=0.0,
            total_amount=0.0,
            free_delivery_threshold=999.0,
            eligible_for_subsidy=False,
            all_items_in_stock=True,
        )

    product_ids = [item.product_id for item in payload.items]
    query = select(Product).where(Product.id.in_(product_ids))
    result = await db.execute(query)
    products_by_id = {p.id: p for p in result.scalars().all()}

    calculated_items = []
    subtotal = 0.0
    all_in_stock = True

    for item in payload.items:
        product = products_by_id.get(item.product_id)
        if not product:
            continue

        item_total = product.price * item.quantity
        subtotal += item_total
        has_stock = product.in_stock and product.stock_quantity >= item.quantity
        if not has_stock:
            all_in_stock = False

        calc_item = CalculatedCartItem(
            product_id=product.id,
            product_name=product.name,
            brand=product.brand,
            category=product.category_name,
            image=product.main_image,
            pack_size=product.pack_size,
            unit_price=product.price,
            quantity=item.quantity,
            total_price=round(item_total, 2),
            sku=product.sku,
            in_stock=has_stock,
            available_stock=product.stock_quantity,
        )
        calculated_items.append(calc_item)

    # 1. Volume Bulk Discount: 5% on orders >= ₹2,500
    volume_discount = round(subtotal * 0.05, 2) if subtotal >= 2500 else 0.0

    # 2. Kisan Subsidy: ₹100 direct support on orders >= ₹1,000
    eligible_for_subsidy = subtotal >= 1000
    farmer_subsidy_discount = 100.0 if (eligible_for_subsidy and payload.kisan_subsidy_applied) else 0.0

    # 3. Net items after discounts
    net_items_price = max(0.0, subtotal - volume_discount - farmer_subsidy_discount)

    # 4. Delivery Charge: Free if net items >= ₹999, else standard ₹80
    free_delivery_threshold = 999.0
    delivery_charge = 0.0 if (net_items_price >= free_delivery_threshold or net_items_price == 0) else 80.0

    # 5. Agrochemical GST: 5% concessional agricultural rate
    tax_gst = round(net_items_price * 0.05, 2)

    # 6. Authoritative Final Total
    total_amount = round(net_items_price + delivery_charge + tax_gst, 2)

    return CartPricingResponse(
        items=calculated_items,
        subtotal=round(subtotal, 2),
        discount=round(volume_discount, 2),
        farmer_subsidy_discount=round(farmer_subsidy_discount, 2),
        delivery_charge=round(delivery_charge, 2),
        tax_gst=round(tax_gst, 2),
        total_amount=round(total_amount, 2),
        free_delivery_threshold=free_delivery_threshold,
        eligible_for_subsidy=eligible_for_subsidy,
        all_items_in_stock=all_in_stock,
    )
