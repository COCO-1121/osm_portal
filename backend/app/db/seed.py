from sqlalchemy import select

from app.core.security import hash_password
from app.db.database import SessionLocal
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
        "name": "Tripathi",
        "email": "admin@osm.test",
        "phone": "9000000001",
        "institute_id": "INST-001",
        "password": "Admin@123",
        "role": "ADMIN",
    },
]


def seed_roles(db):
    for role_name in DEFAULT_ROLES:
        existing_role = db.scalar(
            select(Role).where(Role.name == role_name)
        )

        if existing_role:
            print(f"Role already exists: {role_name}")
            continue

        db.add(Role(name=role_name))
        print(f"Added role: {role_name}")

    db.commit()


def seed_users(db):
    for user_data in TEST_USERS:
        existing_user = db.scalar(
            select(User).where(
                User.user_id == user_data["user_id"]
            )
        )

        if existing_user:
            print(f"User already exists: {user_data['user_id']}")
            continue

        role = db.scalar(
            select(Role).where(
                Role.name == user_data["role"]
            )
        )

        if not role:
            raise ValueError(
                f"Role not found: {user_data['role']}"
            )

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

        print(
            f"Added user: {user_data['user_id']} "
            f"({user_data['role']})"
        )

    db.commit()


def seed_database():
    db = SessionLocal()

    try:
        seed_roles(db)
        seed_users(db)

        print("Database seeding completed successfully.")

    except Exception as error:
        db.rollback()
        print(f"Database seeding failed: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()