import shutil
from pathlib import Path
from sqlalchemy import select
from app.db.session import AdminSessionLocal as SessionLocal
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User
from app.models.answer_script import AnswerScript
from app.models.ufm_case import UFMCase


def seed_ufm_cases():
    db = SessionLocal()

    try:
        uploads_dir = Path("app/storage/uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        base_pdf = uploads_dir / "BC2026001.pdf"

        # Get EXAMINER role
        examiner_role = db.scalar(
            select(Role).where(Role.name == "EXAMINER")
        )
        if examiner_role is None:
            print("[seed_ufm] EXAMINER role not found.")
            return

        # Get Admin ADM001
        admin = db.scalar(
            select(User).where(User.user_id == "ADM001")
        )

        # Get or create EX023 examiner
        examiner = db.scalar(
            select(User).where(User.user_id == "EX023")
        )
        if examiner is None:
            examiner = User(
                user_id="EX023",
                name="Examiner EX023",
                email="ex023@osm.test",
                phone="9876543210",
                institute_id="INST-001",
                password_hash=hash_password("Examiner@123"),
                role_id=examiner_role.id,
                managed_by_admin_id=admin.id if admin else None,
                is_active=True,
            )
            db.add(examiner)
            db.flush()

        ufm_samples = [
            {
                "barcode": "BC102341",
                "subject": "Mathematics",
                "centre_id": "CTR101",
                "file_path": "/files/uploads/BC102341.pdf",
                "reason": "Writing Roll No./Reg. No./Religious Symbol/Prayer/Appeal",
                "examiner_remarks": "Roll number written on answer booklet page 3.",
                "status": "PENDING_ADMIN_REVIEW",
            },
            {
                "barcode": "BC102342",
                "subject": "Physics",
                "centre_id": "CTR102",
                "file_path": "/files/uploads/BC102342.pdf",
                "reason": "Writing Any Extraneous Irrelevant Unwanted Not/Remarks/Mobile No.",
                "examiner_remarks": "Mobile number written on bottom of Page 4.",
                "status": "PENDING_ADMIN_REVIEW",
            },
            {
                "barcode": "BC102343",
                "subject": "Chemistry",
                "centre_id": "CTR103",
                "file_path": "/files/uploads/BC102343.pdf",
                "reason": "Writing In Different Handwritings",
                "examiner_remarks": "Substantial difference in handwriting style between Section A and Section B.",
                "status": "PENDING_ADMIN_REVIEW",
            },
        ]

        for item in ufm_samples:
            target_pdf = uploads_dir / f"{item['barcode']}.pdf"
            if not target_pdf.exists() and base_pdf.exists():
                shutil.copy(base_pdf, target_pdf)

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

            ufm_case = db.scalar(
                select(UFMCase).where(UFMCase.answer_script_id == script.id)
            )
            if ufm_case is None:
                ufm_case = UFMCase(
                    answer_script_id=script.id,
                    reported_by_examiner_id=examiner.id,
                    reason=item["reason"],
                    examiner_remarks=item["examiner_remarks"],
                    status=item["status"],
                )
                db.add(ufm_case)

        db.commit()
        print("[seed_ufm] UFM sample cases seeded successfully.")
    except Exception as error:
        db.rollback()
        print(f"[seed_ufm] Error: {error}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_ufm_cases()
