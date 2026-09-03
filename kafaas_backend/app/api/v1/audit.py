from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.admin import AuditLogRead
from app.auth.permissions import require_role

router = APIRouter(prefix="/audit", tags=["Security & Audit Logs"])


@router.get("/logs", response_model=List[AuditLogRead])
async def list_audit_logs(
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_admin: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve immutable chronological audit trail of platform events (Admin only)."""
    query = select(AuditLog).order_by(AuditLog.timestamp.desc())

    if action:
        query = query.where(AuditLog.action.ilike(f"%{action}%"))
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)

    query = query.limit(limit)
    result = await db.execute(query)
    return [AuditLogRead.model_validate(log) for log in result.scalars().all()]
