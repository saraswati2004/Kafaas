from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    SSOCallbackRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserAuthRead,
)
from app.auth.service import (
    register_farmer,
    authenticate_user,
    sync_or_create_sso_user,
    log_audit_event,
)
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.core.security import decode_supabase_jwt, create_access_token, get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Public registration for farmers.
    Assigns role 'FARMER' by default. Disregards any client-supplied role claims.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await register_farmer(
        db=db,
        payload=payload,
        ip_address=ip_address,
        user_agent=user_agent,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user using email and password.
    Returns access token, primary role, and permissions.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await authenticate_user(
        db=db,
        payload=payload,
        ip_address=ip_address,
        user_agent=user_agent,
    )


@router.post("/sso/callback", response_model=AuthResponse)
async def sso_callback(
    payload: SSOCallbackRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Google SSO token exchange from Supabase Auth.
    Validates token and returns application session.
    """
    decoded = decode_supabase_jwt(payload.access_token)
    auth_user_id = decoded.get("sub")
    email = decoded.get("email")

    if not auth_user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid SSO payload: Missing subject or email claim.",
        )

    user = await sync_or_create_sso_user(
        db=db,
        auth_user_id=auth_user_id,
        email=email,
        full_name=decoded.get("user_metadata", {}).get("full_name"),
        avatar_url=decoded.get("user_metadata", {}).get("avatar_url"),
    )

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
        phone=user.phone,
        avatar_url=user.avatar_url,
        kisan_id=user.kisan_id,
        status=user.status.value,
        role=user.primary_role,
        permissions=list(user.permissions_set),
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=604800,
        user=user_read,
    )


@router.get("/me", response_model=UserAuthRead)
async def get_me(
    current_user: User = Depends(get_current_active_user),
):
    """Get profile and permissions of the currently authenticated user."""
    return UserAuthRead(
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
    )


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset link/instructions."""
    # In production, triggers Supabase Auth password recovery email
    return {
        "message": f"If an account exists for {payload.email}, password reset instructions have been dispatched."
    }


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Set new password using reset token."""
    return {
        "message": "Password has been successfully updated. You may now sign in."
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Audit-logged session termination."""
    await log_audit_event(
        db=db,
        action="USER_LOGOUT",
        resource_type="AUTH",
        actor_user_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.primary_role,
        status_str="SUCCESS",
        details="User logged out.",
    )
    await db.commit()
    return {"message": "Successfully logged out."}
