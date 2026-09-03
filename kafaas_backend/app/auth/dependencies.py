from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import decode_supabase_jwt
from app.core.logging import logger
from app.models.user import User, Role, AccountStatusEnum
from app.auth.service import sync_or_create_sso_user

# HTTP Bearer Auth Scheme
bearer_scheme = HTTPBearer(auto_error=True)
optional_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Centralized JWT authentication dependency.
    Validates Supabase JWT signature, expiration, issuer, extracts 'sub',
    and loads the corresponding user and roles from PostgreSQL.
    """
    token = credentials.credentials
    payload = decode_supabase_jwt(token)
    
    auth_user_id = payload.get("sub")
    if not auth_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject identifier (sub)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Query application user with eager loaded roles & permissions
    query = (
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.addresses),
            selectinload(User.preferences),
            selectinload(User.vendor_profile),
        )
        .where(User.auth_user_id == auth_user_id)
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    # If user exists in Supabase identity provider but not yet synchronized to DB (e.g. first SSO login)
    if not user:
        email = payload.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found in application database and token missing email claim.",
            )
        user = await sync_or_create_sso_user(
            db=db,
            auth_user_id=auth_user_id,
            email=email,
            full_name=payload.get("user_metadata", {}).get("full_name"),
            avatar_url=payload.get("user_metadata", {}).get("avatar_url"),
        )

    # Check account status
    if user.status == AccountStatusEnum.SUSPENDED:
        logger.warning(f"Access denied for suspended user {user.id} ({user.email}).")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently suspended. Please contact support.",
        )
    if user.status == AccountStatusEnum.DISABLED:
        logger.warning(f"Access denied for disabled user {user.id} ({user.email}).")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been disabled.",
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensures the authenticated user has an ACTIVE status."""
    if current_user.status != AccountStatusEnum.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active.",
        )
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Returns the authenticated user if token is present and valid; otherwise None."""
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = decode_supabase_jwt(token)
        auth_user_id = payload.get("sub")
        if not auth_user_id:
            return None
        
        query = (
            select(User)
            .options(selectinload(User.roles).selectinload(Role.permissions))
            .where(User.auth_user_id == auth_user_id)
        )
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        if user and user.status == AccountStatusEnum.ACTIVE:
            return user
        return None
    except Exception:
        return None
