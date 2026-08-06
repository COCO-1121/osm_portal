import shutil
from pathlib import Path
from sqlalchemy import select
from app.db.session import AdminSessionLocal as SessionLocal
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User
from app.models.answer_script import AnswerScript
from app.models.script_rejection import ScriptRejection


def seed_test_rejection():
    db = SessionLocal()

    try:
        # Ensure uploads folder exists
        uploads_dir = Path("app/storage/uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)

        base_pdf = uploads_dir / "BC2026001.pdf"

        # Get EXAMINER role
        examiner_role = db.scalar(
            select(Role).where(Role.name == "EXAMINER")
        )
        if examiner_role is None:
            print("EXAMINER role not found.")
            return

        # Get Admin ADM001
        admin = db.scalar(
            select(User).where(User.user_id == "ADM001")
        )
        if admin is None:
            admin = db.scalar(select(User))
            if admin is None:
                print("No admin user found.")
                return

        # Find or Create Examiner EXM001
        examiner = db.scalar(
            select(User).where(User.user_id == "EXM001")
        )
        if examiner is None:
            examiner = User(
                user_id="EXM001",
                name="Test Examiner",
                email="test.exm001@osm.test",
                phone="9999999001",
                institute_id="INST-001",
                password_hash=hash_password("Examiner@123"),
                role_id=examiner_role.id,
                managed_by_admin_id=admin.id,
                is_active=True,
            )
            db.add(examiner)
            db.flush()
            print("Created test examiner: EXM001")
        else:
            examiner.managed_by_admin_id = admin.id
            print("Updated examiner to be managed by admin.")

        sample_scripts = [
            {
                "barcode": "BC2026001",
                "subject": "Computer Science",
                "centre_id": "CTR001",
                "file_path": "/files/uploads/BC2026001.pdf",
                "reason": "Illegible Handwriting / Blurred Image",
                "examiner_remarks": "Scanned pages are blurred and difficult to evaluate.",
                "status": "PENDING_ADMIN_REVIEW",
            },
            {
                "barcode": "BC2026003",
                "subject": "Mathematics",
                "centre_id": "CTR003",
                "file_path": "/files/uploads/BC2026003.pdf",
                "reason": "Missing Pages",
                "examiner_remarks": "Pages 3 and 4 appear to be missing from the answer script.",
                "status": "PENDING_ADMIN_REVIEW",
            },
            {
                "barcode": "100245",
                "subject": "Physics",
                "centre_id": "CTR-LKO-001",
                "file_path": "/files/uploads/100245.pdf",
                "reason": "Missing Page",
                "examiner_remarks": "Page 2 missing from Physics script.",
                "status": "PENDING_ADMIN_REVIEW",
            },
            {
                "barcode": "BC2026004",
                "subject": "Chemistry",
                "centre_id": "CTR004",
                "file_path": "/files/uploads/BC2026004.pdf",
                "reason": "Improper Scanning",
                "examiner_remarks": "Scan orientation is upside down and margins are cut off.",
                "status": "PENDING_ADMIN_REVIEW",
            },
            {
                "barcode": "BC2026005",
                "subject": "English",
                "centre_id": "CTR005",
                "file_path": "/files/uploads/BC2026005.pdf",
                "reason": "Answer Book of different Subject",
                "examiner_remarks": "Answer book uploaded under English belongs to History.",
                "status": "PENDING_ADMIN_REVIEW",
            },
            {
                "barcode": "BC2026006",
                "subject": "Biology",
                "centre_id": "CTR006",
                "file_path": "/files/uploads/BC2026006.pdf",
                "reason": "Same page Scan twice",
                "examiner_remarks": "Page 5 of the answer script has been scanned twice in duplicate.",
                "status": "PENDING_ADMIN_REVIEW",
            },
        ]

        for item in sample_scripts:
            # Copy PDF file if base exists
            target_pdf = uploads_dir / f"{item['barcode']}.pdf"
            if not target_pdf.exists() and base_pdf.exists():
                shutil.copy(base_pdf, target_pdf)
                print(f"Copied base PDF to {target_pdf}")

            script = db.scalar(
                select(AnswerScript).where(AnswerScript.barcode == item["barcode"])
            )
            if script is None:
                script = AnswerScript(
                    barcode=item["barcode"],
                    subject=item["subject"],
                    centre_id=item["centre_id"],
                    file_path=item["file_path"],
                    assigned_examiner_id=examiner.id,
                    status=item["status"],
                )
                db.add(script)
                db.flush()
                print(f"Created test answer script: {item['barcode']}")
            else:
                script.file_path = item["file_path"]

            rejection = db.scalar(
                select(ScriptRejection).where(ScriptRejection.answer_script_id == script.id)
            )
            if rejection is None:
                rejection = ScriptRejection(
                    answer_script_id=script.id,
                    rejected_by_examiner_id=examiner.id,
                    reason=item["reason"],
                    examiner_remarks=item["examiner_remarks"],
                    status=item["status"],
                )
                db.add(rejection)
                print(f"Created test rejection for script {item['barcode']}.")

        db.commit()
        print("Test rejection data seeded successfully.")

    except Exception as error:
        db.rollback()
        print(f"Error: {error}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_test_rejection()