from sqlalchemy import select
from app.core.security import hash_password
from app.db.session import AdminSessionLocal, ExaminerSessionLocal, UploaderSessionLocal
from app.models.role import Role
from app.models.user import User


DEFAULT_ROLES = [
    "ADMIN",
    "EXAMINER",
    "UPLOADER",
]


TEST_USERS = [
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
            continue

        role = db.scalar(
            select(Role).where(
                Role.name == user_data["role"]
            )
        )

        if not role:
            # Fallback to any role if role name exact match fails
            role = db.scalar(select(Role))

        if not role:
            continue

        user = User(
            user_id=user_data["user_id"],
            name=user_data["name"],
            email=user_data["email"],
            phone=user_data["phone"],
            institute_id=user_data["institute_id"],
            password_hash=hash_password(
                user_data["password"]
            ),
            role_id=role.id,
            is_active=True,
        )

        db.add(user)

    db.commit()


def seed_session(session_factory, name):
    db = session_factory()
    try:
        seed_roles(db)
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