from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.config.models import User
from src.middleware.auth import get_current_user
from src.modules.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from src.modules.auth import service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Registracija novog korisnika."""
    user = await service.register_user(db, data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login — vraća access + refresh token."""
    user = await service.authenticate_user(db, data.email, data.password)
    return TokenResponse(
        access_token=service.create_access_token(user.id),
        refresh_token=service.create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    """Novi access token korišćenjem refresh tokena."""
    user_id = service.decode_token(refresh_token, expected_type="refresh")
    await service.get_user_by_id(db, user_id)
    return TokenResponse(
        access_token=service.create_access_token(user_id),
        refresh_token=service.create_refresh_token(user_id),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Trenutno ulogovani korisnik."""
    return current_user
