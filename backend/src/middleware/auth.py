from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.config.models import User
from src.modules.auth.service import decode_token, get_user_by_id
from src.utils.errors import AuthError

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency — extracts user from JWT Bearer token."""
    user_id = decode_token(credentials.credentials, expected_type="access")
    return await get_user_by_id(db, user_id)
