import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.user import (
    User,
    Role,
    Permission,
    UserRoleEnum,
    AccountStatusEnum,
    Address,
    UserPreference,
)
from app.models.product import Category, Product, ProductSpecification
from app.models.recommendation import (
    Crop,
    CropDisease,
    DiseaseRecommendation,
    RecommendedProductItem,
    FarmerScanHistory,
)
from app.models.inventory import (
    VendorProfile,
    VendorInventory,
    InventoryTransaction,
    VendorChangeRequest,
)
from app.models.order import Order, OrderItem, OrderTrackingEvent
from app.models.audit import AuditLog
from app.models.settings import SystemSetting
from app.core.security import get_password_hash
from app.core.logging import logger


async def seed_database(session_factory: Optional[async_sessionmaker[AsyncSession]] = None):
    """Seeds default roles, permissions, admin, vendor, farmer accounts, and catalog data."""
    factory = session_factory or AsyncSessionLocal
    async with factory() as db:
        # Check if roles already seeded
        role_check = await db.execute(select(Role).where(Role.name == UserRoleEnum.ADMIN.value))
        if role_check.scalar_one_or_none():
            logger.info("Database already seeded with core roles. Skipping full reseed.")
            return

        logger.info("Seeding database with default KaFaaS ecosystem data...")

        # 1. SEED PERMISSIONS
        permissions_data = [
            ("user:read_self", "View own profile"),
            ("user:update_self", "Update own profile"),
            ("product:read", "Browse product catalog"),
            ("product:create", "Create global store products (Admin)"),
            ("product:update", "Update global store products (Admin)"),
            ("product:delete", "Delete store products (Admin)"),
            ("cart:read", "View shopping cart"),
            ("cart:write", "Add/remove items in shopping cart"),
            ("order:create", "Place agricultural input orders"),
            ("order:read_self", "View own orders and tracking"),
            ("order:cancel_self", "Cancel own eligible orders"),
            ("vendor:read_self", "View vendor dashboard and metrics"),
            ("vendor:update_self", "Update vendor preferences"),
            ("vendor:submit_change", "Submit profile change requests"),
            ("inventory:read", "View warehouse stock levels"),
            ("inventory:update", "Perform stock adjustments and restock intake"),
            ("admin:user_manage", "Manage users and role assignments"),
            ("admin:vendor_manage", "Approve/reject vendors and change requests"),
            ("admin:product_manage", "Administer product catalog and categories"),
            ("admin:inventory_manage", "Oversee multi-warehouse inventory"),
            ("admin:order_manage", "Control order lifecycle state machine"),
            ("admin:audit_read", "View security and administrative audit logs"),
        ]

        perms_dict = {}
        for name, desc in permissions_data:
            p = Permission(id=str(uuid.uuid4()), name=name, description=desc)
            db.add(p)
            perms_dict[name] = p

        await db.flush()

        # 2. SEED ROLES
        farmer_role = Role(
            id=str(uuid.uuid4()),
            name=UserRoleEnum.FARMER.value,
            description="Agricultural producer / farmer role",
        )
        farmer_perms = [
            "user:read_self", "user:update_self", "product:read",
            "cart:read", "cart:write", "order:create", "order:read_self", "order:cancel_self"
        ]
        for p_name in farmer_perms:
            farmer_role.permissions.append(perms_dict[p_name])
        db.add(farmer_role)

        vendor_role = Role(
            id=str(uuid.uuid4()),
            name=UserRoleEnum.VENDOR.value,
            description="Authorized regional agro-supplier and fulfillment warehouse",
        )
        vendor_perms = [
            "user:read_self", "user:update_self", "product:read",
            "vendor:read_self", "vendor:update_self", "vendor:submit_change",
            "inventory:read", "inventory:update"
        ]
        for p_name in vendor_perms:
            vendor_role.permissions.append(perms_dict[p_name])
        db.add(vendor_role)

        admin_role = Role(
            id=str(uuid.uuid4()),
            name=UserRoleEnum.ADMIN.value,
            description="Platform administrator with global management privileges",
        )
        for p in perms_dict.values():
            admin_role.permissions.append(p)
        db.add(admin_role)

        await db.flush()

        # 3. SEED DEFAULT DEMO USERS
        # Admin User
        admin_user = User(
            id="usr-admin-1",
            auth_user_id="auth-admin-uuid-0001",
            email="admin@kafaas.com",
            full_name="Rajesh Sharma",
            phone="+91 98110 12345",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
            status=AccountStatusEnum.ACTIVE,
            hashed_password=get_password_hash("Admin@12345"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_login_at=datetime.now(timezone.utc),
        )
        admin_user.roles.append(admin_role)
        db.add(admin_user)

        # Vendor User & Profile
        vendor_user = User(
            id="usr-vendor-1",
            auth_user_id="auth-vendor-uuid-0001",
            email="vendor@kafaas.com",
            full_name="Suresh Verma",
            phone="+91 98260 77889",
            avatar_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
            status=AccountStatusEnum.ACTIVE,
            hashed_password=get_password_hash("Vendor@12345"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_login_at=datetime.now(timezone.utc),
        )
        vendor_user.roles.append(vendor_role)
        db.add(vendor_user)

        vendor_profile = VendorProfile(
            id="vnd-profile-1",
            user_id=vendor_user.id,
            business_name="AgroTech Solutions Indore",
            contact_person="Suresh Verma",
            phone="+91 98260 77889",
            email="vendor.agrotech@kafaas.com",
            gstin="23AABCA1234F1Z8",
            license_number="AGRI/MP/IND/2022/9041",
            warehouse_address="Plot 18, Sanwer Road Industrial Area, Sector B, Indore",
            state="Madhya Pradesh",
            district="Indore",
            bank_account_name="AgroTech Solutions Current A/C",
            bank_account_number="918020038910291",
            ifsc_code="HDFC0001024",
            approval_status="approved",
        )
        db.add(vendor_profile)

        # Farmer User
        farmer_user = User(
            id="usr-farmer-1",
            auth_user_id="auth-farmer-uuid-0001",
            email="farmer@kafaas.com",
            full_name="Ramesh Patel",
            phone="+91 98765 43210",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            kisan_id="KISAN-MP-2024-8841",
            status=AccountStatusEnum.ACTIVE,
            hashed_password=get_password_hash("Farmer@12345"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_login_at=datetime.now(timezone.utc),
        )
        farmer_user.roles.append(farmer_role)
        db.add(farmer_user)

        farmer_address = Address(
            id="addr-1",
            user_id=farmer_user.id,
            name="Ramesh Patel (Farm Gate #2)",
            phone="+91 98765 43210",
            address_line1="Survey No. 42/1, Gram Panchayat Road",
            village_or_city="Badnawar",
            district="Dhar",
            state="Madhya Pradesh",
            pincode="454660",
            is_default=True,
            address_type="farm",
        )
        db.add(farmer_address)

        farmer_pref = UserPreference(
            user_id=farmer_user.id,
            language="hi",
            notifications_enabled=True,
            preferred_crops=["Tomato", "Cotton", "Soybean", "Wheat"],
        )
        db.add(farmer_pref)

        await db.flush()

        # 4. SEED CATEGORIES
        categories_data = [
            ("Fertilizers", "fertilizers", "Balanced plant nutrition, NPK, water-soluble and micronutrients", "Sprout", "https://images.unsplash.com/photo-1585336261026-76a0862089f2?w=400"),
            ("Fungicides", "fungicides", "Curative and systemic plant fungal infection control", "ShieldCheck", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400"),
            ("Pesticides", "pesticides", "Crop insect, pest, and bollworm protection", "Bug", "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400"),
            ("Herbicides", "herbicides", "Targeted post-emergence weed control", "Scissors", "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400"),
            ("Seeds", "seeds", "High-yield hybrid certified crop varieties", "Wheat", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"),
            ("Bio Products", "bio-products", "100% organic bio-stimulants and mycorrhiza", "Leaf", "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400"),
            ("Crop Protection", "crop-protection", "Complete integrated crop management solutions", "Shield", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400"),
        ]

        for name, slug, desc, icon, img in categories_data:
            cat = Category(
                id=str(uuid.uuid4()),
                name=name,
                slug=slug,
                description=desc,
                icon_name=icon,
                image_url=img,
            )
            db.add(cat)

        await db.flush()

        # 5. SEED 12 TOP AGROCHEMICAL PRODUCTS
        products_data = [
            {
                "id": "prod-1",
                "name": "Bayer Nativo 75 WG Fungicide",
                "brand": "Bayer CropScience",
                "category_name": "Fungicides",
                "sku": "BAY-NAT-500G",
                "price": 1450.0,
                "original_price": 1680.0,
                "discount_percentage": 14,
                "pack_size": "500 g",
                "form": "Water Dispersible Granules (WG)",
                "main_image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
                "is_organic": False,
                "stock_quantity": 185,
                "description": "Bayer Nativo 75 WG is a systemic broad-spectrum fungicide with protective and curative action.",
                "short_description": "Systemic fungicide providing superior control against Early Blight & Powdery Mildew.",
                "recommended_for_diseases": ["dis-1", "dis-4"],
                "benefits": ["Dual active molecule", "Translaminar systemic movement", "Extended protection window"],
                "usage_instructions": ["Dissolve 1g per Litre of clean water", "Spray early in morning"],
                "safety_precautions": ["Wear nitrile gloves", "Do not spray against wind direction"],
                "specifications": {
                    "technical_name": "Tebuconazole 50% + Trifloxystrobin 25% WG",
                    "formulation": "Water Dispersible Granules (WG)",
                    "dosage_per_acre": "120g - 150g in 200 Litres water",
                    "dosage_per_liter": "0.75g - 1g / Litre",
                    "target_crops": ["Tomato", "Chilli", "Paddy", "Grape", "Mango"],
                    "target_pests_and_diseases": ["Early Blight", "Anthracnose", "Sheath Blight", "Powdery Mildew"],
                    "application_method": "Foliar Spray",
                    "waiting_period_days": 15,
                    "toxicity_class": "Blue (Moderate)",
                    "manufacturer": "Bayer CropScience India Ltd.",
                    "country_of_origin": "India",
                    "shelf_life_months": 24,
                },
            },
            {
                "id": "prod-2",
                "name": "FMC Coragen Insecticide (Rynaxypyr 18.5% SC)",
                "brand": "FMC India",
                "category_name": "Pesticides",
                "sku": "FMC-COR-150ML",
                "price": 1850.0,
                "original_price": 2100.0,
                "discount_percentage": 12,
                "pack_size": "150 ml",
                "form": "Suspension Concentrate (SC)",
                "main_image": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80",
                "is_organic": False,
                "stock_quantity": 90,
                "description": "FMC Coragen is a world-class anthranilic diamide insecticide providing long-lasting control of bollworms.",
                "short_description": "Targeted ovicidal & larvicidal control for Bollworm and Stem Borer.",
                "recommended_for_diseases": ["dis-2"],
                "benefits": ["Safe for beneficial honeybees", "Fast feeding cessation within 7 minutes"],
                "usage_instructions": ["Dilute 0.4ml per Litre of water", "Apply uniformly on foliage"],
                "safety_precautions": ["Store away from food items", "Keep out of reach of children"],
                "specifications": {
                    "technical_name": "Chlorantraniliprole 18.5% SC",
                    "formulation": "Suspension Concentrate (SC)",
                    "dosage_per_acre": "60ml in 200 Litres water",
                    "dosage_per_liter": "0.3ml - 0.4ml / Litre",
                    "target_crops": ["Cotton", "Paddy", "Sugarcane", "Tomato", "Brinjal"],
                    "target_pests_and_diseases": ["American Bollworm", "Pink Bollworm", "Stem Borer"],
                    "application_method": "Foliar Spray",
                    "waiting_period_days": 14,
                    "toxicity_class": "Green (Slight)",
                    "manufacturer": "FMC India Pvt. Ltd.",
                    "country_of_origin": "India",
                    "shelf_life_months": 36,
                },
            },
            {
                "id": "prod-3",
                "name": "IFFCO 19:19:19 100% Water Soluble NPK",
                "brand": "IFFCO",
                "category_name": "Fertilizers",
                "sku": "IFF-NPK-1KG",
                "price": 280.0,
                "original_price": 320.0,
                "discount_percentage": 13,
                "pack_size": "1 kg",
                "form": "100% Soluble Crystals",
                "main_image": "https://images.unsplash.com/photo-1585336261026-76a0862089f2?auto=format&fit=crop&w=800&q=80",
                "is_organic": False,
                "stock_quantity": 420,
                "description": "IFFCO 19:19:19 is a balanced water-soluble fertilizer containing essential primary nutrients (N, P, K).",
                "short_description": "Balanced macronutrient booster for vegetative growth and root vigor.",
                "recommended_for_diseases": ["dis-1", "dis-3"],
                "benefits": ["100% water solubility", "Rapid absorption through stomata"],
                "usage_instructions": ["Use 5g per Litre for foliar spray", "Suitable for fertigation"],
                "safety_precautions": ["Avoid inhalation of fine dust", "Reseal tightly after use"],
                "specifications": {
                    "technical_name": "NPK 19:19:19 Water Soluble Fertilizer",
                    "formulation": "Crystalline Powder",
                    "dosage_per_acre": "1kg - 1.5kg in 200 Litres water",
                    "dosage_per_liter": "5g / Litre",
                    "target_crops": ["All Agricultural and Horticultural Crops"],
                    "target_pests_and_diseases": ["Nutritional Deficiency", "Growth Stunting"],
                    "application_method": "Foliar Spray & Drip Fertigation",
                    "waiting_period_days": 0,
                    "toxicity_class": "Green (Non-Toxic)",
                    "manufacturer": "Indian Farmers Fertiliser Cooperative (IFFCO)",
                    "country_of_origin": "India",
                    "shelf_life_months": 36,
                },
            },
            {
                "id": "prod-4",
                "name": "Syngenta Amistar Top Fungicide",
                "brand": "Syngenta",
                "category_name": "Fungicides",
                "sku": "SYN-AMS-200ML",
                "price": 1250.0,
                "original_price": 1420.0,
                "discount_percentage": 12,
                "pack_size": "200 ml",
                "form": "Suspension Concentrate (SC)",
                "main_image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
                "is_organic": False,
                "stock_quantity": 75,
                "description": "Syngenta Amistar Top delivers excellent curative and preventive protection against stubborn blights.",
                "short_description": "Azoxystrobin + Difenoconazole dual power against blights and rusts.",
                "recommended_for_diseases": ["dis-1", "dis-5"],
                "benefits": ["Xylem systemic movement", "Greening effect on plant foliage"],
                "usage_instructions": ["1ml per Litre of water", "Apply when first symptoms appear"],
                "safety_precautions": ["Avoid skin contact", "Dispose of empty bottle safely"],
                "specifications": {
                    "technical_name": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
                    "formulation": "Suspension Concentrate (SC)",
                    "dosage_per_acre": "200ml in 200 Litres water",
                    "dosage_per_liter": "1ml / Litre",
                    "target_crops": ["Tomato", "Paddy", "Cotton", "Chilli", "Potato"],
                    "target_pests_and_diseases": ["Early Blight", "Late Blight", "Sheath Blight", "Yellow Rust"],
                    "application_method": "Foliar Spray",
                    "waiting_period_days": 14,
                    "toxicity_class": "Blue (Moderate)",
                    "manufacturer": "Syngenta India Ltd.",
                    "country_of_origin": "India",
                    "shelf_life_months": 24,
                },
            },
            {
                "id": "prod-5",
                "name": "Bio-NPK Consortium & Trichoderma Viride",
                "brand": "National BioAgri",
                "category_name": "Bio Products",
                "sku": "BIO-NPK-1L",
                "price": 450.0,
                "original_price": 550.0,
                "discount_percentage": 18,
                "pack_size": "1 Litre",
                "form": "Liquid Bio-Fertilizer",
                "main_image": "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
                "is_organic": True,
                "stock_quantity": 310,
                "description": "100% Certified organic multi-strain microbial consortium containing Azotobacter, PSB, KMB and Trichoderma.",
                "short_description": "100% Certified Organic bio-fertilizer for root immunity and soil revitalization.",
                "recommended_for_diseases": ["dis-1", "dis-4"],
                "benefits": ["Solubilizes fixed soil phosphorus", "Suppresses soil-borne pathogens naturally"],
                "usage_instructions": ["Soil drenching: 1L per acre with irrigation", "Seed treatment: 10ml/kg"],
                "safety_precautions": ["Do not mix with chemical bactericides", "Store in cool shaded area"],
                "specifications": {
                    "technical_name": "Bio-Fertilizer Consortium (CFU 1x10^8/ml)",
                    "formulation": "Liquid Biological Culture",
                    "dosage_per_acre": "1 Litre in 200 Litres water (Soil Drench)",
                    "dosage_per_liter": "5ml / Litre",
                    "target_crops": ["All Crops, Vegetables, and Pulses"],
                    "target_pests_and_diseases": ["Root Rot", "Wilt", "Nutrient Fixation"],
                    "application_method": "Soil Drenching / Drip / Seed Treatment",
                    "waiting_period_days": 0,
                    "toxicity_class": "Green (100% Non-Toxic Organic)",
                    "manufacturer": "National BioAgri Laboratories",
                    "country_of_origin": "India",
                    "shelf_life_months": 12,
                },
            },
            {
                "id": "prod-6",
                "name": "Dhanuka Conika Fungicide",
                "brand": "Dhanuka Agritech",
                "category_name": "Fungicides",
                "sku": "DHA-CON-250G",
                "price": 820.0,
                "original_price": 950.0,
                "discount_percentage": 14,
                "pack_size": "250 g",
                "form": "Wettable Powder (WP)",
                "main_image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
                "is_organic": False,
                "stock_quantity": 110,
                "description": "Dhanuka Conika is an effective Japanese-origin combination of Kasugamycin + Copper Oxychloride.",
                "short_description": "Dual action bactericide and fungicide for Dieback and Bacterial Leaf Spot.",
                "recommended_for_diseases": ["dis-4"],
                "benefits": ["Controls both bacterial and fungal co-infections", "Rapid plant rainfastness"],
                "usage_instructions": ["Dissolve 1.5g per Litre of water", "Apply uniformly across canopy"],
                "safety_precautions": ["Wash hands thoroughly after use"],
                "specifications": {
                    "technical_name": "Kasugamycin 5% + Copper Oxychloride 45% WP",
                    "formulation": "Wettable Powder (WP)",
                    "dosage_per_acre": "300g in 200 Litres water",
                    "dosage_per_liter": "1.5g / Litre",
                    "target_crops": ["Chilli", "Tomato", "Paddy"],
                    "target_pests_and_diseases": ["Anthracnose / Dieback", "Bacterial Blast"],
                    "application_method": "Foliar Spray",
                    "waiting_period_days": 10,
                    "toxicity_class": "Blue (Moderate)",
                    "manufacturer": "Dhanuka Agritech Ltd.",
                    "country_of_origin": "India",
                    "shelf_life_months": 24,
                },
            },
        ]

        for p_data in products_data:
            specs_data = p_data.pop("specifications")
            prod = Product(**p_data, vendor_id="vnd-profile-1", vendor_name="AgroTech Solutions Indore")
            db.add(prod)

            specs = ProductSpecification(
                id=str(uuid.uuid4()),
                product_id=prod.id,
                **specs_data
            )
            db.add(specs)

            # Add vendor inventory stock record
            v_inv = VendorInventory(
                id=str(uuid.uuid4()),
                vendor_id="vnd-profile-1",
                product_id=prod.id,
                available_stock=prod.stock_quantity,
                reserved_stock=5,
                low_stock_threshold=20,
                warehouse_location="Indore Hub Sector B",
                last_restocked_at=datetime.now(timezone.utc),
            )
            db.add(v_inv)

        await db.flush()

        # 6. SEED CROPS AND DISEASES
        crops_data = [
            ("crop-1", "Tomato", "टमाटर", "Vegetables", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", ["Kharif", "Rabi", "Zaid"]),
            ("crop-2", "Cotton", "कपास", "Cash Crops", "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=400", ["Kharif"]),
            ("crop-3", "Paddy (Rice)", "धान (चावल)", "Cereals", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", ["Kharif"]),
            ("crop-4", "Chilli", "मिर्च", "Spices", "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400", ["Kharif", "Rabi"]),
            ("crop-5", "Potato", "आलू", "Vegetables", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", ["Rabi"]),
            ("crop-6", "Wheat", "गेहूं", "Cereals", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", ["Rabi"]),
        ]

        for cid, name, hname, cat, img, sz in crops_data:
            c = Crop(id=cid, name=name, hindi_name=hname, category=cat, image_url=img, seasons=sz)
            db.add(c)

        await db.flush()

        diseases_data = [
            {
                "id": "dis-1",
                "crop_id": "crop-1",
                "name": "Early Blight",
                "hindi_name": "अगेती झुलसा",
                "scientific_name": "Alternaria solani",
                "severity": "Severe",
                "affected_parts": "Lower leaves, stems, and fruits",
                "symptoms": ["Concentric circular target-board spots", "Yellowing of leaf margins", "Premature leaf defoliation"],
                "causes": ["High humidity (>85%) and temperature between 24-29°C", "Overhead irrigation splash"],
                "preventive_measures": ["Use certified fungicide-treated seeds", "Maintain adequate plant spacing", "Avoid overhead sprinkler splashing"],
                "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500",
            },
            {
                "id": "dis-2",
                "crop_id": "crop-2",
                "name": "American Bollworm & Whitefly",
                "hindi_name": "अमेरिकन सुंडी और सफेद मक्खी",
                "scientific_name": "Helicoverpa armigera / Bemisia tabaci",
                "severity": "Critical",
                "affected_parts": "Squares, flower buds, bolls, and young leaves",
                "symptoms": ["Holes bored into cotton bolls", "Yellow mosaic leaf curling", "Sticky honeydew secretions with sooty mold"],
                "causes": ["Warm dry spells followed by humid intervals", "Excessive nitrogenous fertilization"],
                "preventive_measures": ["Install yellow sticky pheromone traps", "Adopt recommended IPM spray intervals"],
                "image_url": "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500",
            },
            {
                "id": "dis-3",
                "crop_id": "crop-3",
                "name": "Paddy Blast Disease",
                "hindi_name": "धान का झोंका रोग",
                "scientific_name": "Magnaporthe oryzae",
                "severity": "Severe",
                "affected_parts": "Leaves, nodes, and panicle neck",
                "symptoms": ["Spindle-shaped diamond lesions with greyish center", "Broken rotten panicle necks resulting in chaffy grains"],
                "causes": ["Cloudy weather with intermittent drizzles", "High humidity and dense nitrogen application"],
                "preventive_measures": ["Apply balanced potassium nutrition", "Avoid stagnant water during tillering"],
                "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500",
            },
            {
                "id": "dis-4",
                "crop_id": "crop-4",
                "name": "Chilli Anthracnose & Dieback",
                "hindi_name": "मिर्च का डाई-बैक और फल सड़न",
                "scientific_name": "Colletotrichum capsici",
                "severity": "Severe",
                "affected_parts": "Twigs, tender shoots, and ripe fruits",
                "symptoms": ["Drying of twigs from top downwards", "Sunken circular fruit lesions with black dots"],
                "causes": ["Continuous rains during flowering and fruit set"],
                "preventive_measures": ["Prune and destroy infected shoot tips", "Spray systemic protective fungicides"],
                "image_url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500",
            },
        ]

        for d_info in diseases_data:
            cd = CropDisease(**d_info)
            db.add(cd)

        await db.flush()

        # 7. SEED RECOMMENDATION ADVISORY MATRIX
        recs_data = [
            {
                "id": "rec-1",
                "crop_id": "crop-1",
                "crop_name": "Tomato",
                "disease_id": "dis-1",
                "disease_name": "Early Blight",
                "disease_severity": "Severe",
                "advisory_note": "Early Blight (Alternaria solani) requires immediate dual-action systemic fungicide application combined with root biostimulation.",
                "is_active": True,
                "products": [
                    {
                        "product_id": "prod-1",
                        "category_name": "Fungicides",
                        "role": "Primary Curative Treatment",
                        "priority": 1,
                        "reason": "Tebuconazole 50% + Trifloxystrobin 25% WG gives rapid translaminar curative halt against Alternaria solani mycelium.",
                        "application_schedule": "Spray 1g / Litre water immediately. Repeat after 12 days if humidity persists.",
                    },
                    {
                        "product_id": "prod-4",
                        "category_name": "Fungicides",
                        "role": "Broad Spectrum Protector",
                        "priority": 2,
                        "reason": "Azoxystrobin + Difenoconazole ensures extended preventative barrier and greener foliage recovery.",
                        "application_schedule": "Alternate with Nativo in 2nd spray (1ml / Litre water).",
                    },
                    {
                        "product_id": "prod-5",
                        "category_name": "Bio Products",
                        "role": "Soil & Root Enhancer",
                        "priority": 3,
                        "reason": "Trichoderma bio-consortium builds systemic acquired resistance (SAR) in root zones.",
                        "application_schedule": "Soil drench 5ml / Litre at root zone during irrigation.",
                    },
                ],
            },
            {
                "id": "rec-2",
                "crop_id": "crop-2",
                "crop_name": "Cotton",
                "disease_id": "dis-2",
                "disease_name": "American Bollworm & Whitefly",
                "disease_severity": "Critical",
                "advisory_note": "Bollworm infestation requires immediate ovicidal & larvicidal intervention to protect squaring bolls.",
                "is_active": True,
                "products": [
                    {
                        "product_id": "prod-2",
                        "category_name": "Pesticides",
                        "role": "Primary Larvicide",
                        "priority": 1,
                        "reason": "FMC Coragen stops insect feeding within minutes and provides 21-day residual control.",
                        "application_schedule": "Foliar spray 0.4ml / Litre clean water.",
                    },
                ],
            },
        ]

        for r_info in recs_data:
            p_list = r_info.pop("products")
            rec = DiseaseRecommendation(**r_info)
            db.add(rec)
            await db.flush()

            for item in p_list:
                rec_item = RecommendedProductItem(
                    id=str(uuid.uuid4()),
                    recommendation_id=rec.id,
                    **item,
                    is_active=True,
                )
                db.add(rec_item)

        await db.flush()

        # 8. SEED SAMPLE ORDER FOR FARMER
        sample_order_id = "ord-sample-001"
        sample_order_no = "KFS-2026-8841"
        sample_order = Order(
            id=sample_order_id,
            order_number=sample_order_no,
            user_id=farmer_user.id,
            customer_name="Ramesh Patel",
            customer_phone="+91 98765 43210",
            customer_email="farmer@kafaas.com",
            shipping_address={
                "name": "Ramesh Patel (Farm Gate #2)",
                "phone": "+91 98765 43210",
                "addressLine1": "Survey No. 42/1, Gram Panchayat Road",
                "villageOrCity": "Badnawar",
                "district": "Dhar",
                "state": "Madhya Pradesh",
                "pincode": "454660",
            },
            pricing={
                "subtotal": 1450.0,
                "discount": 0.0,
                "farmerSubsidyDiscount": 100.0,
                "deliveryCharge": 0.0,
                "taxGst": 67.5,
                "totalAmount": 1417.5,
            },
            status="confirmed",
            payment_status="paid",
            payment_method="upi",
            payment_transaction_id="TXN-UPI-88419012",
            cancellation_allowed=True,
            vendor_id="vnd-profile-1",
            created_at=datetime.now(timezone.utc) - timedelta(hours=8),
            updated_at=datetime.now(timezone.utc) - timedelta(hours=8),
            estimated_delivery_date=datetime.now(timezone.utc) + timedelta(days=2),
        )

        sample_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=sample_order_id,
            product_id="prod-1",
            product_name="Bayer Nativo 75 WG Fungicide",
            brand="Bayer CropScience",
            category="Fungicides",
            image="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
            pack_size="500 g",
            unit_price=1450.0,
            quantity=1,
            total_price=1450.0,
            sku="BAY-NAT-500G",
            vendor_id="vnd-profile-1",
            vendor_name="AgroTech Solutions Indore",
        )
        sample_order.items = [sample_item]

        sample_order.timeline = [
            OrderTrackingEvent(
                id=str(uuid.uuid4()),
                order_id=sample_order_id,
                status="pending",
                title="Consignment Booked",
                description="Order received and Kisan Subsidy verified.",
                location="KaFaaS Regional Portal",
                completed=True,
                timestamp=datetime.now(timezone.utc) - timedelta(hours=8),
            ),
            OrderTrackingEvent(
                id=str(uuid.uuid4()),
                order_id=sample_order_id,
                status="confirmed",
                title="Order Confirmed",
                description="Payment and inventory stock locked successfully.",
                location="AgroTech Central Depot, Indore",
                completed=True,
                timestamp=datetime.now(timezone.utc) - timedelta(hours=6),
            ),
            OrderTrackingEvent(
                id=str(uuid.uuid4()),
                order_id=sample_order_id,
                status="processing",
                title="Packaging & Quality Checked",
                description="Active ingredient seal inspected and packed.",
                location="Indore Hub Sector B",
                completed=False,
                timestamp=datetime.now(timezone.utc) + timedelta(hours=4),
            ),
            OrderTrackingEvent(
                id=str(uuid.uuid4()),
                order_id=sample_order_id,
                status="shipped",
                title="Dispatched in Transit",
                description="Handed over to rural logistics freight.",
                location="State Highway 27 Hub",
                completed=False,
                timestamp=datetime.now(timezone.utc) + timedelta(days=1),
            ),
        ]
        db.add(sample_order)

        # 9. SEED SYSTEM SETTINGS
        settings_defaults = [
            ("free_delivery_minimum", "999", "Free delivery threshold in INR"),
            ("standard_delivery_fee", "80", "Standard rural freight charge in INR"),
            ("kisan_subsidy_amount", "100", "Direct farmer subsidy benefit in INR"),
            ("kisan_subsidy_threshold", "1000", "Minimum cart subtotal to qualify for subsidy"),
            ("agri_gst_percent", "5", "Concessional agrochemical GST percentage"),
        ]
        for key, val, desc in settings_defaults:
            st = SystemSetting(id=key, key=key, value=val, description=desc)
            db.add(st)

        # 10. SEED SAMPLE AUDIT LOG
        audit = AuditLog(
            id=str(uuid.uuid4()),
            actor_name="System Initializer",
            actor_role="SYSTEM",
            action="SYSTEM_INIT",
            resource_type="DATABASE",
            status="SUCCESS",
            details="Initial schema seed completed with default roles and agrochemical catalog.",
        )
        db.add(audit)

        await db.commit()
        logger.info("Database seeding completed successfully.")
