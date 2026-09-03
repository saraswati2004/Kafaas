from typing import List, Callable, Any
from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRoleEnum
from app.auth.dependencies import get_current_active_user
from app.core.logging import logger


def require_role(*allowed_roles: str) -> Callable[[User], User]:
    """
    Dependency factory that checks if the authenticated user has one of the allowed roles.
    Example: Depends(require_role("ADMIN", "VENDOR"))
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        user_roles = [r.name for r in current_user.roles]
        
        # Check if any user role matches allowed roles
        has_role = any(role in allowed_roles for role in user_roles)
        
        if not has_role:
            logger.warning(
                f"Access denied: User {current_user.id} ({current_user.email}) "
                f"with roles {user_roles} attempted to access endpoint requiring {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have the required role privileges for this operation.",
            )
        return current_user

    return role_checker


def require_permission(*required_permissions: str) -> Callable[[User], User]:
    """
    Dependency factory that checks if the authenticated user possesses the specific granular permissions.
    Admins automatically inherit all operational permissions.
    Example: Depends(require_permission("product:create", "product:update"))
    """
    async def permission_checker(current_user: User = Depends(get_current_active_user)) -> User:
        # Admin bypass
        user_roles = [r.name for r in current_user.roles]
        if UserRoleEnum.ADMIN.value in user_roles:
            return current_user

        user_perms = current_user.permissions_set
        has_permission = any(perm in user_perms for perm in required_permissions)

        if not has_permission:
            logger.warning(
                f"Access denied: User {current_user.id} lacks required permissions {required_permissions}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Insufficient permission to perform this action.",
            )
        return current_user

    return permission_checker


def check_resource_ownership(
    resource_owner_user_id: str,
    current_user: User,
    admin_bypass: bool = True,
) -> None:
    """
    Enforces object-level ownership authorization.
    Ensures a farmer/vendor cannot read or mutate another user's private data.
    """
    user_roles = [r.name for r in current_user.roles]
    if admin_bypass and UserRoleEnum.ADMIN.value in user_roles:
        return

    if str(resource_owner_user_id) != str(current_user.id):
        logger.warning(
            f"Object-level authorization breach attempt: User {current_user.id} "
            f"attempted to access resource owned by {resource_owner_user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not authorized to view or modify this record.",
        )
