from sqlalchemy import select
from app.core.security import hash_password
from app.db.session import AdminSessionLocal, ExaminerSessionLocal, UploaderSessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.institution import Institution


DEFAULT_ROLES = [
    "SUPER_ADMIN",
    "ADMIN",
    "EXAMINER",
    "UPLOADER",
]


TEST_USERS = [
    {
        "user_id": "SUPERADMIN",
        "name": "OSM Super Administrator",
        "email": "superadmin@osm.test",
        "phone": "9000000000",
        "institute_id": "HQ-001",
        "password": "SuperAdmin@123",
        "role": "SUPER_ADMIN",
    },
    {
        "user_id": "ADM001",
        "name": "Tripathi (Admin)",
        "email": "admin@osm.test",
        "phone": "9000000001",
        "institute_id": "INST-001",
        "password": "Admin@123",
        "role": "ADMIN",
    },
    {
        "user_id": "EXM001",
        "name": "Default Examiner",
        "email": "examiner@osm.test",
        "phone": "9000000002",
        "institute_id": "INST-001",
        "password": "Examiner@123",
        "role": "EXAMINER",
        "dob": "1990-01-01",
    },
    {
        "user_id": "UPL001",
        "name": "Default Uploader",
        "email": "uploader@osm.test",
        "phone": "9000000003",
        "institute_id": "INST-001",
        "password": "Uploader@123",
        "role": "UPLOADER",
    },
]


DEFAULT_INSTITUTION = {
    "institute_id": "INST-001",
    "name": "Central Assessment Institution",
    "institution_type": "University",
    "email": "institution@osm.test",
    "phone": "9876543210",
    "address": "Campus Block A, Tech Hub",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "contact_person_name": "Dr. A. K. Sharma",
    "contact_person_email": "registrar@osm.test",
    "contact_person_phone": "9876543211",
    "password": "Inst@123",
}


def seed_roles(db):
    for role_name in DEFAULT_ROLES:
        existing_role = db.scalar(
            select(Role).where(Role.name == role_name)
        )

        if not existing_role:
            db.add(Role(name=role_name))

    db.commit()


def seed_users(db):
    for user_data in TEST_USERS:
        existing_user = db.scalar(
            select(User).where(
                User.user_id == user_data["user_id"]
            )
        )

        if existing_user:
            if "dob" in user_data:
                existing_user.dob = user_data["dob"]
            db.commit()
            continue

        role = db.scalar(
            select(Role).where(
                Role.name == user_data["role"]
            )
        )

        if not role:
            role = db.scalar(select(Role))

        if not role:
            continue

        user = User(
            user_id=user_data["user_id"],
            name=user_data["name"],
            email=user_data["email"],
            phone=user_data["phone"],
            institute_id=user_data["institute_id"],
            dob=user_data.get("dob"),   
            password_hash=hash_password(
                user_data["password"]
            ),
            role_id=role.id,
            is_active=True,
        )

        db.add(user)

    db.commit()


def seed_institutions(db):
    existing = db.scalar(
        select(Institution).where(
            Institution.institute_id == DEFAULT_INSTITUTION["institute_id"]
        )
    )
    if not existing:
        inst = Institution(
            institute_id=DEFAULT_INSTITUTION["institute_id"],
            name=DEFAULT_INSTITUTION["name"],
            institution_type=DEFAULT_INSTITUTION["institution_type"],
            email=DEFAULT_INSTITUTION["email"],
            phone=DEFAULT_INSTITUTION["phone"],
            address=DEFAULT_INSTITUTION["address"],
            city=DEFAULT_INSTITUTION["city"],
            state=DEFAULT_INSTITUTION["state"],
            pincode=DEFAULT_INSTITUTION["pincode"],
            contact_person_name=DEFAULT_INSTITUTION["contact_person_name"],
            contact_person_email=DEFAULT_INSTITUTION["contact_person_email"],
            contact_person_phone=DEFAULT_INSTITUTION["contact_person_phone"],
            password_hash=hash_password(DEFAULT_INSTITUTION["password"]),
            status="Active",
            is_active=True,
        )
        db.add(inst)
        db.commit()


def seed_session(session_factory, name):
    db = session_factory()
    try:
        seed_roles(db)
        seed_institutions(db)
        seed_users(db)
        print(f"[{name}] Database seeding completed successfully.")
    except Exception as error:
        db.rollback()
        print(f"[{name}] Database seeding warning: {error}")
    finally:
        db.close()


def seed_database():
    seed_session(AdminSessionLocal, "Admin DB")
    seed_session(ExaminerSessionLocal, "Examiner DB")
    seed_session(UploaderSessionLocal, "Uploader DB")


if __name__ == "__main__":
    seed_database()