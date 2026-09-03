from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters.")
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    kisan_id: Optional[str] = Field(None, max_length=50)

    @field_validator("password")
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v


class LoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str


class SSOCallbackRequest(BaseModel):
    access_token: str = Field(..., description="Supabase Auth access token obtained from Google SSO")


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 604800


class RoleSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: Optional[str] = None


class UserAuthRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    auth_user_id: str
    email: str
    full_name: str
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    kisan_id: Optional[str] = None
    status: str
    role: str
    permissions: List[str] = []


class AuthResponse(BaseModel):
    access_token: str
    token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = 604800
    user: UserAuthRead
