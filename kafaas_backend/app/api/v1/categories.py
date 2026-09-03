from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.models.product import Category, Product
from app.schemas.product import CategoryRead

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryRead])
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all agricultural product categories with dynamic item counts."""
    query = select(Category).order_by(Category.name.asc())
    result = await db.execute(query)
    categories = result.scalars().all()

    response = []
    for cat in categories:
        count_query = select(func.count()).select_from(Product).where(Product.category_name == cat.name)
        count = (await db.execute(count_query)).scalar_one()
        cat_read = CategoryRead(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            icon_name=cat.icon_name,
            image_url=cat.image_url,
            product_count=count,
        )
        response.append(cat_read)

    return response
