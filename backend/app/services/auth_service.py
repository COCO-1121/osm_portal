from app.models.user import User
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest
from app.utils.password import verify_password

def login_user(db: Session, data: LoginRequest):
    print("\n" + "=" * 60)
    print("🔑 DEBUG: EXAMINER LOGIN FORM INPUTS RECEIVED FROM TEXTBOXES")
    print(f"  📥 Examiner User ID: '{data.examiner_id}'")
    print(f"  📥 Institute ID:     '{data.institute_id}'")
    print(f"  📥 Contact (Email/Phone): '{data.contact}'")
    print(f"  📥 Password:         '{data.password}'")
    print("-" * 60)
    print("🔍 CHECKING AGAINST DATABASE RECORDS...")

    # Step 1: Query user by user_id alone to inspect exact record stored in DB
    user = db.query(User).filter(User.user_id == data.examiner_id).first()

    if not user:
        print(f"  ❌ Step 1 (User ID): No user found with user_id = '{data.examiner_id}'")
        print("⛔ LOGIN RESULT: FAILED (User ID not found in database)")
        print("=" * 60 + "\n")
        return None
    
    print(f"  ✅ Step 1 (User ID): Found user '{user.user_id}' ({user.name})")

    # Step 2: Check Institute ID
    if user.institute_id == data.institute_id:
        print(f"  ✅ Step 2 (Institute ID): Match! Input '{data.institute_id}' == DB '{user.institute_id}'")
    else:
        print(f"  ❌ Step 2 (Institute ID): MISMATCH! Input '{data.institute_id}' != DB '{user.institute_id}'")

    # Step 3: Check Contact (Email or Phone)
    contact_match = (data.contact == user.email) or (data.contact == user.phone)
    if contact_match:
        print(f"  ✅ Step 3 (Contact): Match! Input '{data.contact}' matches DB (Email: '{user.email}', Phone: '{user.phone}')")
    else:
        print(f"  ❌ Step 3 (Contact): MISMATCH! Input '{data.contact}' does not match DB (Email: '{user.email}', Phone: '{user.phone}')")

    # Step 4: Check Password
    pwd_match = verify_password(data.password, user.password_hash)
    if pwd_match:
        print(f"  ✅ Step 4 (Password): Match! Password verification passed.")
    else:
        print(f"  ❌ Step 4 (Password): MISMATCH! Provided password does not match stored hash.")

    print("-" * 60)
    if user.institute_id == data.institute_id and contact_match and pwd_match:
        print("🎉 LOGIN RESULT: SUCCESSFUL ✅")
        print("=" * 60 + "\n")
        return user
    else:
        print("⛔ LOGIN RESULT: FAILED ❌")
        print("=" * 60 + "\n")
        return None