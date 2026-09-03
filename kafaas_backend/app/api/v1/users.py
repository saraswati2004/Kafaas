import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User, Address, UserPreference
from app.schemas.user import (
    UserDetailRead,
    UserProfileUpdate,
    AddressRead,
    AddressCreate,
    AddressUpdate,
    UserPreferenceRead,
    UserPreferenceUpdate,
)
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import check_resource_ownership

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


@router.get("/me", response_model=UserDetailRead)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve full profile, addresses, preferences, and permissions of the active user."""
    return UserDetailRead(
        id=current_user.id,
        auth_user_id=current_user.auth_user_id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        kisan_id=current_user.kisan_id,
        status=current_user.status.value,
        role=current_user.primary_role,
        permissions=list(current_user.permissions_set),
        addresses=[AddressRead.model_validate(a) for a in current_user.addresses],
        preferences=UserPreferenceRead.model_validate(current_user.preferences) if current_user.preferences else None,
        created_at=current_user.created_at,
    )


@router.put("/me", response_model=UserDetailRead)
async def update_user_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile attributes."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    if payload.kisan_id is not None:
        current_user.kisan_id = payload.kisan_id

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return UserDetailRead(
        id=current_user.id,
        auth_user_id=current_user.auth_user_id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        kisan_id=current_user.kisan_id,
        status=current_user.status.value,
        role=current_user.primary_role,
        permissions=list(current_user.permissions_set),
        addresses=[AddressRead.model_validate(a) for a in current_user.addresses],
        preferences=UserPreferenceRead.model_validate(current_user.preferences) if current_user.preferences else None,
        created_at=current_user.created_at,
    )


# --- ADDRESSES ENDPOINTS (Object-level ownership verified) ---

@router.get("/addresses", response_model=List[AddressRead])
async def get_user_addresses(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List farm/delivery addresses belonging to the authenticated user."""
    query = select(Address).where(Address.user_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/addresses", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
async def add_user_address(
    payload: AddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a new farm or delivery address."""
    # Check if this is the first address or requested as default
    existing_count_query = select(Address).where(Address.user_id == current_user.id)
    result = await db.execute(existing_count_query)
    existing_addrs = result.scalars().all()

    is_first = len(existing_addrs) == 0
    should_be_default = payload.is_default or is_first

    if should_be_default:
        # Clear existing defaults
        for addr in existing_addrs:
            addr.is_default = False
            db.add(addr)

    new_address = Address(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=payload.name,
        phone=payload.phone,
        alternate_phone=payload.alternate_phone,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        landmark=payload.landmark,
        village_or_city=payload.village_or_city,
        district=payload.district,
        state=payload.state,
        pincode=payload.pincode,
        is_default=should_be_default,
        address_type=payload.address_type,
    )
    db.add(new_address)
    await db.commit()
    await db.refresh(new_address)
    return new_address


@router.put("/addresses/{address_id}", response_model=AddressRead)
async def update_user_address(
    address_id: str,
    payload: AddressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an address with strict ownership validation."""
    query = select(Address).where(Address.id == address_id)
    result = await db.execute(query)
    address = result.scalar_one_or_none()

    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found.")

    # Object-level ownership check
    check_resource_ownership(address.user_id, current_user)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(address, field, value)

    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_address(
    address_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an address with ownership validation."""
    query = select(Address).where(Address.id == address_id)
    result = await db.execute(query)
    address = result.scalar_one_or_none()

    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found.")

    check_resource_ownership(address.user_id, current_user)

    await db.delete(address)
    await db.commit()
    return None


@router.put("/addresses/{address_id}/default", response_model=AddressRead)
async def set_default_address(
    address_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Set the specified address as the primary default."""
    query = select(Address).where(Address.user_id == current_user.id)
    result = await db.execute(query)
    addresses = result.scalars().all()

    target = next((a for a in addresses if a.id == address_id), None)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found.")

    for a in addresses:
        a.is_default = (a.id == address_id)
        db.add(a)

    await db.commit()
    await db.refresh(target)
    return target


# --- PREFERENCES ENDPOINTS ---

@router.put("/preferences", response_model=UserPreferenceRead)
async def update_preferences(
    payload: UserPreferenceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update farmer preferences."""
    query = select(UserPreference).where(UserPreference.user_id == current_user.id)
    result = await db.execute(query)
    pref = result.scalar_one_or_none()

    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if payload.language is not None:
        pref.language = payload.language
    if payload.notifications_enabled is not None:
        pref.notifications_enabled = payload.notifications_enabled
    if payload.preferred_crops is not None:
        pref.preferred_crops = payload.preferred_crops

    db.add(pref)
    await db.commit()
    await db.refresh(pref)
    return pref
