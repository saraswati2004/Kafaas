from fastapi import APIRouter
from app.auth.router import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.products import router as products_router, admin_products_router
from app.api.v1.categories import router as categories_router
from app.api.v1.cart import router as cart_router
from app.api.v1.orders import router as orders_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.vendors import router as vendors_router
from app.api.v1.admin import router as admin_router
from app.api.v1.audit import router as audit_router
from app.api.v1.weather import router as weather_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(admin_products_router)
api_v1_router.include_router(categories_router)
api_v1_router.include_router(cart_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(recommendations_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(vendors_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(weather_router)
