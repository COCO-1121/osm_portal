from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from user_agents import parse

from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.login_history import LoginHistory
from app.schemas.auth import (
    AdminLoginRequest,
    LoginResponse,
    UserResponse,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/admin/login",
    response_model=LoginResponse,
)
def admin_login(
    request: Request,
    credentials: AdminLoginRequest,
    db: Session = Depends(get_db),
):
    # Find admin by User ID
    user = db.scalar(
        select(User)
        .options(joinedload(User.role))
        .where(User.user_id == credentials.user_id)
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Admin User ID."
        )

    if user.phone != credentials.phone:
        raise HTTPException(
            status_code=401,
            detail="Invalid Phone Number."
        )

    if user.institute_id != credentials.institute_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid Institute ID."
        )

    if not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect Password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive."
        )

    if user.role.name != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    access_token = create_access_token(
        subject=str(user.id),
        role=user.role.name,
    )

    # Parse user agent
    user_agent_str = request.headers.get("user-agent", "")
    parsed_ua = parse(user_agent_str)
    browser = f"{parsed_ua.browser.family} {parsed_ua.browser.version_string}".strip()
    device = f"{parsed_ua.os.family} {parsed_ua.device.family}".strip()
    
    # Record login history
    login_record = LoginHistory(
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        browser=browser if browser else "Unknown",
        device=device if device else "Unknown",
    )
    db.add(login_record)
    db.commit()

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            user_id=user.user_id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            institute_id=user.institute_id,
            role=user.role.name,
        ),
    )