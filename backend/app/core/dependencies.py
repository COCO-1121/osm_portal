from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.session import get_admin_db, get_examiner_db, get_uploader_db, get_db
from app.models.user import User


bearer_scheme = HTTPBearer()


def _get_user_from_db(credentials: HTTPAuthorizationCredentials, db: Session) -> User:
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        subject = payload.get("sub")

        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        user_uuid = UUID(subject)

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    user = db.scalar(
        select(User)
        .options(joinedload(User.role))
        .where(User.id == user_uuid)
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    return _get_user_from_db(credentials, db)


def get_current_uploader_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_uploader_db),
) -> User:
    return _get_user_from_db(credentials, db)


def get_current_examiner_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_examiner_db),
) -> User:
    return _get_user_from_db(credentials, db)


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role.name != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


def require_uploader_role(
    current_user: User = Depends(get_current_uploader_user),
) -> User:
    if current_user.role.name != "UPLOADER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Uploader access required",
        )

    return current_user


def require_examiner_role(
    current_user: User = Depends(get_current_examiner_user),
) -> User:
    if current_user.role.name != "EXAMINER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Examiner access required",
        )

    return current_user