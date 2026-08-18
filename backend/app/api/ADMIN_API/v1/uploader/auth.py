from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.security import create_access_token, verify_password
from app.db.session import get_uploader_db
from app.models.user import User

router = APIRouter(
    prefix="/api/v1/uploader/auth",
    tags=["Uploader Auth"],
)


class UploaderLoginRequest(BaseModel):
    user_id: str
    password: str
    phone: str


def clean_phone(p: str) -> str:
    if not p:
        return ""
    digits = "".join(filter(str.isdigit, str(p)))
    return digits[-10:] if len(digits) >= 10 else digits


@router.post("/login")
def login(data: UploaderLoginRequest, db: Session = Depends(get_uploader_db)):
    user_id_clean = data.user_id.strip()
    phone_clean = data.phone.strip()
    password_clean = data.password

    print("\n" + "=" * 60)
    print("📤 DEBUG: UPLOADER LOGIN FORM INPUTS RECEIVED FROM TEXTBOXES")
    print(f"  📥 Uploader User ID: '{user_id_clean}'")
    print(f"  📥 Phone Number:      '{phone_clean}'")
    print(f"  📥 Password:          '{password_clean}'")
    print("-" * 60)
    print("🔍 CHECKING AGAINST DATABASE RECORDS...")

    # Step 1: Query user by user_id
    user = db.scalar(
        select(User)
        .options(joinedload(User.role))
        .where(User.user_id == user_id_clean)
    )

    if not user:
        print(f"  ❌ Step 1 (User ID): No user found with user_id = '{user_id_clean}'")
        print("⛔ LOGIN RESULT: FAILED (User ID not found in database)")
        print("=" * 60 + "\n")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid User ID or credentials",
        )

    print(f"  ✅ Step 1 (User ID): Found user '{user.user_id}' ({user.name})")

    # Step 2: Check Role
    role_name = user.role.name if user.role else ""
    if role_name == "UPLOADER":
        print(f"  ✅ Step 2 (Role): Match! User role is '{role_name}'")
    else:
        print(f"  ❌ Step 2 (Role): MISMATCH! User role is '{role_name}', expected 'UPLOADER'")

    # Step 3: Check Phone Number (flexible digit matching)
    db_phone_clean = clean_phone(user.phone)
    input_phone_clean = clean_phone(phone_clean)
    phone_matches = (user.phone.strip() == phone_clean) or (db_phone_clean == input_phone_clean)

    if phone_matches:
        print(f"  ✅ Step 3 (Phone Number): Match! Input '{phone_clean}' matches DB '{user.phone}'")
    else:
        print(f"  ❌ Step 3 (Phone Number): MISMATCH! Input '{phone_clean}' != DB '{user.phone}'")

    # Step 4: Check Password
    pwd_match = verify_password(password_clean, user.password_hash)
    if pwd_match:
        print(f"  ✅ Step 4 (Password): Match! Password verification passed.")
    else:
        print(f"  ❌ Step 4 (Password): MISMATCH! Provided password does not match stored hash.")

    print("-" * 60)
    if role_name == "UPLOADER" and phone_matches and pwd_match:
        print("🎉 LOGIN RESULT: SUCCESSFUL ✅")
        print("=" * 60 + "\n")

        access_token = create_access_token(
            subject=str(user.id),
            role="UPLOADER",
            expires_delta=timedelta(minutes=480),
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Uploader Login Successful",
            "user_id": user.user_id,
            "name": user.name,
        }
    else:
        print("⛔ LOGIN RESULT: FAILED ❌")
        print("=" * 60 + "\n")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid User ID, Password, or Phone Number",
        )
