import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Text,
    JSON,
)
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_user_id = Column(String(36), nullable=True, index=True)
    actor_name = Column(String(255), default="System", nullable=False)
    actor_role = Column(String(50), default="ANONYMOUS", nullable=False)
    action = Column(String(100), index=True, nullable=False)
    resource_type = Column(String(100), index=True, nullable=False)
    resource_id = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="SUCCESS", nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
