from sqlalchemy import select

from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User
from app.models.answer_script import AnswerScript
from app.models.script_rejection import ScriptRejection


def seed_test_rejection():
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # Get roles
        # -------------------------------------------------
        examiner_role = db.scalar(
            select(Role).where(Role.name == "EXAMINER")
        )

        if examiner_role is None:
            print("EXAMINER role not found.")
            return

        # -------------------------------------------------
        # Get Admin
        # -------------------------------------------------
        admin = db.scalar(
            select(User).where(
                User.user_id == "ADM001"
            )
        )

        if admin is None:
            print("ADM001 not found.")
            return

        # -------------------------------------------------
        # Find or Create Examiner
        # -------------------------------------------------
        examiner = db.scalar(
            select(User).where(
                User.user_id == "EXM001"
            )
        )

        if examiner is None:

            examiner = User(
                user_id="EXM001",
                name="Test Examiner",
                email="test.exm001@osm.test",
                phone="9999999001",
                institute_id="INST-001",
                password_hash=hash_password(
                    "Examiner@123"
                ),
                role_id=examiner_role.id,

                # NEW
                managed_by_admin_id=admin.id,

                is_active=True,
            )

            db.add(examiner)
            db.flush()

            print("Created test examiner: EXM001")

        else:

            # NEW
            examiner.managed_by_admin_id = admin.id

            print(
                "Updated examiner to be managed by ADM001."
            )

        # -------------------------------------------------
        # Find or Create Answer Script
        # -------------------------------------------------
        script = db.scalar(
            select(AnswerScript).where(
                AnswerScript.barcode == "BC2026003"
            )
        )

        if script is None:

            script = AnswerScript(
                barcode="BC2026003",
                subject="Mathematics",
                centre_id="CTR003",
                file_path="/files/uploads/BC2026003.pdf",

                # Assign to this examiner
                assigned_examiner_id=examiner.id,

                status="PENDING_ADMIN_REVIEW",
            )

            db.add(script)
            db.flush()

            print(
                "Created test answer script: BC2026003"
            )

        else:

            script.file_path = (
                "/files/uploads/BC2026003.pdf"
            )

            script.assigned_examiner_id = examiner.id

            print(
                "Test answer script already exists: BC2026003"
            )

        # -------------------------------------------------
        # Find or Create Rejection
        # -------------------------------------------------
        rejection = db.scalar(
            select(ScriptRejection).where(
                ScriptRejection.answer_script_id
                == script.id
            )
        )

        if rejection is None:

            rejection = ScriptRejection(
                answer_script_id=script.id,
                rejected_by_examiner_id=examiner.id,
                reason="Missing Pages",
                examiner_remarks=(
                    "Pages appear to be missing from the answer script."
                ),
                status="PENDING_ADMIN_REVIEW",
            )

            db.add(rejection)

            print("Created test rejection.")

        else:

            print("Test rejection already exists.")

        db.commit()

        print(
            "Test rejection data seeded successfully."
        )

    except Exception as error:

        db.rollback()

        print(f"Error: {error}")

        raise

    finally:

        db.close()


if __name__ == "__main__":
    seed_test_rejection()