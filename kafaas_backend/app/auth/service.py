import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.user import (
    User,
    Role,
    UserRoleEnum,
    AccountStatusEnum,
    UserPreference,
)
from app.models.audit import AuditLog
from app.schemas.auth import RegisterRequest, LoginRequest, UserAuthRead, AuthResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.logging import logger


async def log_audit_event(
    db: AsyncSession,
    action: str,
    resource_type: str,
    actor_user_id: Optional[str] = None,
    actor_name: str = "System",
    actor_role: str = "ANONYMOUS",
    resource_id: Optional[str] = None,
    status_str: str = "SUCCESS",
    details: str = "",
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    metadata_json: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """Record an immutable audit log entry."""
    audit = AuditLog(
        actor_user_id=actor_user_id,
        actor_name=actor_name,
        actor_role=actor_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        status=status_str,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
        metadata_json=metadata_json or {},
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)
    return audit


async def register_farmer(
    db: AsyncSession,
    payload: RegisterRequest,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> AuthResponse:
    """
    Public registration endpoint.
    Security rule: Default role is strictly 'FARMER'. Client input cannot request ADMIN or VENDOR.
    """
    clean_email = payload.email.strip().lower()

    # 1. Check if email already registered
    existing_user_query = await db.execute(select(User).where(User.email == clean_email))
    if existing_user_query.scalar_one_or_none():
        logger.warning(f"Registration attempt with duplicate email: {payload.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please log in.",
        )

    # 2. Lookup default FARMER role
    farmer_role_query = await db.execute(
        select(Role).options(selectinload(Role.permissions)).where(Role.name == UserRoleEnum.FARMER.value)
    )
    farmer_role = farmer_role_query.scalar_one_or_none()
    if not farmer_role:
        farmer_role = Role(
            id=str(uuid.uuid4()),
            name=UserRoleEnum.FARMER.value,
            description="Agricultural producer / farmer role with e-commerce and advisory access",
        )
        db.add(farmer_role)
        await db.flush()

    # 3. Create user record with mapped Supabase Auth UUID
    auth_user_id = str(uuid.uuid4())
    kisan_id = payload.kisan_id or f"KISAN-MP-{str(uuid.uuid4())[:4].upper()}-{datetime.now().year}"

    new_user = User(
        id=str(uuid.uuid4()),
        auth_user_id=auth_user_id,
        email=clean_email,
        full_name=payload.full_name,
        phone=payload.phone,
        kisan_id=kisan_id,
        status=AccountStatusEnum.ACTIVE,
        hashed_password=get_password_hash(payload.password),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        last_login_at=datetime.now(timezone.utc),
    )
    new_user.roles.append(farmer_role)
    db.add(new_user)
    await db.flush()

    # 4. Create default preferences
    pref = UserPreference(
        user_id=new_user.id,
        language="en",
        notifications_enabled=True,
        preferred_crops=["Tomato", "Cotton", "Paddy (Rice)", "Wheat"],
    )
    db.add(pref)

    # 5. Log audit event
    await log_audit_event(
        db=db,
        action="USER_REGISTRATION",
        resource_type="USER",
        actor_user_id=new_user.id,
        actor_name=new_user.full_name,
        actor_role=UserRoleEnum.FARMER.value,
        resource_id=new_user.id,
        status_str="SUCCESS",
        details=f"New farmer registered with Kisan ID {kisan_id}",
        ip_address=ip_address,
        user_agent=user_agent,
    )

    await db.commit()
    await db.refresh(new_user)

    # 6. Generate access token
    access_token = create_access_token(
        data={
            "sub": new_user.auth_user_id,
            "email": new_user.email,
            "role": UserRoleEnum.FARMER.value,
        }
    )

    user_read = UserAuthRead(
        id=new_user.id,
        auth_user_id=new_user.auth_user_id,
        email=new_user.email,
        full_name=new_user.full_name,
        name=new_user.full_name,
        phone=new_user.phone,
        avatar_url=new_user.avatar_url,
        kisan_id=new_user.kisan_id,
        status=new_user.status.value,
        role=new_user.primary_role,
        permissions=list(new_user.permissions_set),
    )

    return AuthResponse(
        access_token=access_token,
        token=access_token,
        token_type="bearer",
        expires_in=604800,
        user=user_read,
    )


async def authenticate_user(
    db: AsyncSession,
    payload: LoginRequest,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> AuthResponse:
    """
    Authenticate user using email or phone number and password.
    Validates account status (rejection if SUSPENDED or DISABLED).
    """
    identifier = (payload.email or payload.phone or "").strip().lower()

    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide an email address or mobile number.",
        )

    # Lookup by email or phone
    query = (
        select(User)
        .options(selectinload(User.roles).selectinload(Role.permissions))
        .where((User.email == identifier) | (User.phone == identifier))
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        logger.warning(f"Failed login attempt for identifier: {identifier}")
        await log_audit_event(
            db=db,
            action="LOGIN_FAILURE",
            resource_type="AUTH",
            actor_name=identifier,
            status_str="FAILURE",
            details="Invalid credentials supplied.",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check account status
    if user.status == AccountStatusEnum.SUSPENDED:
        logger.warning(f"Suspended user {user.email} attempted login.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended by administration. Please contact support.",
        )
    if user.status == AccountStatusEnum.DISABLED:
        logger.warning(f"Disabled user {user.email} attempted login.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )

    user.last_login_at = datetime.now(timezone.utc)
    db.add(user)

    await log_audit_event(
        db=db,
        action="LOGIN_SUCCESS",
        resource_type="AUTH",
        actor_user_id=user.id,
        actor_name=user.full_name,
        actor_role=user.primary_role,
        resource_id=user.id,
        status_str="SUCCESS",
        details="User logged in successfully.",
        ip_address=ip_address,
        user_agent=user_agent,
    )
    await db.commit()

    access_token = create_access_token(
        data={
            "sub": user.auth_user_id,
            "email": user.email,
            "role": user.primary_role,
        }
    )

    user_read = UserAuthRead(
        id=user.id,
        auth_user_id=user.auth_user_id,
        email=user.email,
        full_name=user.full_name,
        name=user.full_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
        kisan_id=user.kisan_id,
        status=user.status.value,
        role=user.primary_role,
        permissions=list(user.permissions_set),
    )

    return AuthResponse(
        access_token=access_token,
        token=access_token,
        token_type="bearer",
        expires_in=604800,
        user=user_read,
    )


async def sync_or_create_sso_user(
    db: AsyncSession,
    auth_user_id: str,
    email: str,
    full_name: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> User:
    """
    Synchronize or provision user identity originating from Supabase SSO / Google login.
    """
    clean_email = email.strip().lower()
    query = (
        select(User)
        .options(selectinload(User.roles).selectinload(Role.permissions))
        .where((User.auth_user_id == auth_user_id) | (User.email == clean_email))
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if user:
        if user.auth_user_id != auth_user_id:
            user.auth_user_id = auth_user_id
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        user.last_login_at = datetime.now(timezone.utc)
        db.add(user)
        await db.commit()
        return user

    # Create new SSO user with default FARMER role
    farmer_role_query = await db.execute(
        select(Role).where(Role.name == UserRoleEnum.FARMER.value)
    )
    farmer_role = farmer_role_query.scalar_one_or_none()
    if not farmer_role:
        farmer_role = Role(
            id=str(uuid.uuid4()),
            name=UserRoleEnum.FARMER.value,
            description="Agricultural producer / farmer role",
        )
        db.add(farmer_role)
        await db.flush()

    new_user = User(
        id=str(uuid.uuid4()),
        auth_user_id=auth_user_id,
        email=clean_email,
        full_name=full_name or clean_email.split("@")[0].capitalize(),
        avatar_url=avatar_url,
        kisan_id=f"KISAN-MP-{str(uuid.uuid4())[:4].upper()}-{datetime.now().year}",
        status=AccountStatusEnum.ACTIVE,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        last_login_at=datetime.now(timezone.utc),
    )
    new_user.roles.append(farmer_role)
    db.add(new_user)

    pref = UserPreference(
        user_id=new_user.id,
        language="en",
        notifications_enabled=True,
        preferred_crops=["Tomato", "Cotton", "Paddy (Rice)"],
    )
    db.add(pref)
    await db.commit()
    await db.refresh(new_user)
    return new_user
