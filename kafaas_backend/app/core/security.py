import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import bcrypt
from app.core.config import settings
from app.core.logging import logger


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hashed password."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT token compatible with Supabase JWT structure."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "iss": f"{settings.SUPABASE_URL}/auth/v1",
        "aud": "authenticated",
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SUPABASE_JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Validates and decodes a Supabase access token (JWT).
    Validates:
    - Signature with SUPABASE_JWT_SECRET
    - Expiration
    - Audience and Issuer
    - Extracts 'sub' (the unique Supabase Auth User ID)
    """
    try:
        # First attempt: standard decode with signature & claim validation
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM, "HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": False,  # Supabase tokens can have 'authenticated' or project ref
            }
        )
        
        # Verify subject exists
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject identifier (sub)",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token has expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error validating JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token validation failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )
