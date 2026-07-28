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
    print("\n" + "=" * 60)
    print("🔑 DEBUG: ADMIN LOGIN FORM INPUTS RECEIVED FROM TEXTBOXES")
    print(f"  📥 Admin User ID:   '{credentials.user_id}'")
    print(f"  📥 Institute ID:    '{credentials.institute_id}'")
    print(f"  📥 Phone Number:    '{credentials.phone}'")
    print(f"  📥 Password:        '{credentials.password}'")
    print("-" * 60)
    print("🔍 CHECKING AGAINST DATABASE RECORDS (osm_admin)...")

    # Step 1: Find admin by User ID
    user = db.scalar(
        select(User)
        .options(joinedload(User.role))
        .where(User.user_id == credentials.user_id)
    )

    if not user:
        print(f"  ❌ Step 1 (User ID): No user found with user_id = '{credentials.user_id}'")
        print("⛔ LOGIN RESULT: FAILED (User ID not found in database)")
        print("=" * 60 + "\n")
        raise HTTPException(
            status_code=401,
            detail="Invalid Admin User ID."
        )

    print(f"  ✅ Step 1 (User ID): Found user '{user.user_id}' ({user.name})")

    # Step 2: Check Role
    role_name = user.role.name if user.role else ""
    if role_name == "ADMIN":
        print(f"  ✅ Step 2 (Role): Match! User role is '{role_name}'")
    else:
        print(f"  ❌ Step 2 (Role): MISMATCH! User role is '{role_name}', expected 'ADMIN'")

    # Step 3: Check Institute ID
    if user.institute_id == credentials.institute_id:
        print(f"  ✅ Step 3 (Institute ID): Match! Input '{credentials.institute_id}' == DB '{user.institute_id}'")
    else:
        print(f"  ❌ Step 3 (Institute ID): MISMATCH! Input '{credentials.institute_id}' != DB '{user.institute_id}'")

    # Step 4: Check Phone Number
    if user.phone == credentials.phone:
        print(f"  ✅ Step 4 (Phone Number): Match! Input '{credentials.phone}' == DB '{user.phone}'")
    else:
        print(f"  ❌ Step 4 (Phone Number): MISMATCH! Input '{credentials.phone}' != DB '{user.phone}'")

    # Step 5: Check Password
    pwd_match = verify_password(credentials.password, user.password_hash)
    if pwd_match:
        print(f"  ✅ Step 5 (Password): Match! Password verification passed.")
    else:
        print(f"  ❌ Step 5 (Password): MISMATCH! Provided password does not match stored hash.")

    print("-" * 60)
    if role_name == "ADMIN" and user.institute_id == credentials.institute_id and user.phone == credentials.phone and pwd_match:
        print("🎉 LOGIN RESULT: SUCCESSFUL ✅")
        print("=" * 60 + "\n")
    else:
        print("⛔ LOGIN RESULT: FAILED ❌")
        print("=" * 60 + "\n")

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

    if not pwd_match:
        raise HTTPException(
            status_code=401,
            detail="Incorrect Password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive."
        )

    if role_name != "ADMIN":
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