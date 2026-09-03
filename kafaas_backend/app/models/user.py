import uuid
from enum import Enum as PyEnum
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Table,
    Text,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRoleEnum(str, PyEnum):
    FARMER = "FARMER"
    VENDOR = "VENDOR"
    ADMIN = "ADMIN"


class AccountStatusEnum(str, PyEnum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DISABLED = "DISABLED"


# Association table for User <-> Role (Many-to-Many)
user_roles_table = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

# Association table for Role <-> Permission (Many-to-Many)
role_permissions_table = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # auth_user_id maps to Supabase Auth user UUID ('sub' claim)
    auth_user_id = Column(String(36), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    kisan_id = Column(String(100), unique=True, index=True, nullable=True)
    status = Column(Enum(AccountStatusEnum), default=AccountStatusEnum.ACTIVE, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    roles = relationship("Role", secondary=user_roles_table, back_populates="users", lazy="selectin")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    vendor_profile = relationship("VendorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan", lazy="select")
    scans = relationship("FarmerScanHistory", back_populates="user", cascade="all, delete-orphan", lazy="select")

    @property
    def primary_role(self) -> str:
        """Returns the user's highest priority role name (ADMIN > VENDOR > FARMER)."""
        role_names = [r.name for r in self.roles]
        if UserRoleEnum.ADMIN.value in role_names:
            return UserRoleEnum.ADMIN.value
        if UserRoleEnum.VENDOR.value in role_names:
            return UserRoleEnum.VENDOR.value
        return UserRoleEnum.FARMER.value

    @property
    def permissions_set(self) -> set[str]:
        """Collects all unique permission strings assigned via the user's roles."""
        perms = set()
        for r in self.roles:
            for p in r.permissions:
                perms.add(p.name)
        return perms


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)

    users = relationship("User", secondary=user_roles_table, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions_table, back_populates="roles", lazy="selectin")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)

    roles = relationship("Role", secondary=role_permissions_table, back_populates="permissions")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    alternate_phone = Column(String(50), nullable=True)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    landmark = Column(String(255), nullable=True)
    village_or_city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    address_type = Column(String(50), default="farm", nullable=False)

    user = relationship("User", back_populates="addresses")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    language = Column(String(20), default="en", nullable=False)
    notifications_enabled = Column(Boolean, default=True, nullable=False)
    preferred_crops = Column(JSON, default=list, nullable=False)

    user = relationship("User", back_populates="preferences")
