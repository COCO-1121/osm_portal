from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.session import get_admin_db, UploaderSessionLocal
from app.models.answer_script import AnswerScript
from app.models.script_rejection import ScriptRejection
from app.models.uploader.scanned_document import ScannedDocument
from app.models.role import Role
from app.models.user import User
from app.dependencies.auth import get_current_examiner

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/examiner",
    tags=["Examiner Rejections"],
)


class ExaminerRejectScriptRequest(BaseModel):
    barcode: str
    reason: str
    examiner_remarks: str | None = None
    subject: str | None = None


def _get_examiner_user(db: Session, current_examiner: User) -> User:
    """Ensure examiner user instance attached to current Admin DB session."""
    if hasattr(current_examiner, "id"):
        # 1. Direct ID match in Admin DB
        user = db.scalar(select(User).where(User.id == current_examiner.id))
        if user:
            return user

        # 2. Case-insensitive user_id match
        user_id_str = getattr(current_examiner, "user_id", None)
        if user_id_str:
            user_by_code = db.scalar(
                select(User).where(func.lower(User.user_id) == user_id_str.lower())
            )
            if user_by_code:
                return user_by_code

        # 3. Case-insensitive email match
        email_str = getattr(current_examiner, "email", None)
        if email_str:
            user_by_email = db.scalar(
                select(User).where(func.lower(User.email) == email_str.lower())
            )
            if user_by_email:
                return user_by_email

    # 4. Fallback to standard EXM001 in Admin DB
    fallback = db.scalar(select(User).where(User.user_id == "EXM001"))
    if fallback:
        return fallback

    # 5. Fallback to any examiner in Admin DB
    any_examiner = db.scalar(select(User).join(Role).where(Role.name == "EXAMINER"))
    if any_examiner:
        return any_examiner

    return current_examiner


@router.post("/reject-script")
@router.post("/rejections")
def reject_script(
    payload: ExaminerRejectScriptRequest,
    db: Session = Depends(get_admin_db),
    current_examiner: User = Depends(get_current_examiner),
):
    """
    Allows logged-in Examiner to submit an answer script rejection.
    Sets status to PENDING_ADMIN_REVIEW so assigned Admin can verify it.
    NOTE: ScannedDocument in uploader DB is intentionally NOT marked as Rejected here.
    It will only be marked as Rejected if the Admin decides RETURN_TO_UPLOADER.
    """
    examiner = _get_examiner_user(db, current_examiner)

    # 1. Find or create AnswerScript in Admin DB
    script = db.scalar(
        select(AnswerScript).where(AnswerScript.barcode == payload.barcode)
    )

    if script is None:
        file_path = f"/files/uploads/{payload.barcode}.pdf"
        subject_name = payload.subject or "General Evaluation"

        # Check Uploader DB for actual uploaded document details if available
        try:
            with UploaderSessionLocal() as uploader_db:
                scanned_doc = uploader_db.scalar(
                    select(ScannedDocument).where(ScannedDocument.barcode == payload.barcode)
                )
                if scanned_doc:
                    if scanned_doc.file_path:
                        file_path = scanned_doc.file_path
                    if scanned_doc.exam_id and not payload.subject:
                        subject_name = scanned_doc.exam_id
        except Exception as e:
            logger.warning(f"Could not read from uploader DB: {e}")

        script = AnswerScript(
            barcode=payload.barcode,
            subject=subject_name or "General Evaluation",
            centre_id="CTR001",
            file_path=file_path,
            assigned_examiner_id=examiner.id,
            status="PENDING_ADMIN_REVIEW",
        )
        db.add(script)
        db.flush()
    else:
        script.status = "PENDING_ADMIN_REVIEW"
        script.assigned_examiner_id = examiner.id

    # 2. Find or create ScriptRejection record in Admin DB
    rejection = db.scalar(
        select(ScriptRejection).where(ScriptRejection.answer_script_id == script.id)
    )

    if rejection is None:
        rejection = ScriptRejection(
            answer_script_id=script.id,
            rejected_by_examiner_id=examiner.id,
            reason=payload.reason,
            examiner_remarks=payload.examiner_remarks,
            status="PENDING_ADMIN_REVIEW",
        )
        db.add(rejection)
    else:
        rejection.reason = payload.reason
        rejection.examiner_remarks = payload.examiner_remarks
        rejection.status = "PENDING_ADMIN_REVIEW"
        rejection.rejected_by_examiner_id = examiner.id
        rejection.rejected_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "message": "Script submitted for admin verification successfully",
        "rejection_id": str(rejection.id),
        "barcode": script.barcode,
        "status": "PENDING_ADMIN_REVIEW",
    }


@router.get("/rejected-scripts")
@router.get("/rejected-queue")
def get_examiner_returned_scripts(
    db: Session = Depends(get_admin_db),
    current_examiner: User = Depends(get_current_examiner),
):
    """
    Returns answer scripts that were returned to this examiner by the Admin for re-evaluation.
    Supports scripts returned from both Script Rejection reviews and UFM reviews.
    """
    from app.models.admin_review_action import AdminReviewAction
    from app.models.ufm_case import UFMCase

    examiner = _get_examiner_user(db, current_examiner)
    is_admin = getattr(examiner, "role", None) and getattr(examiner.role, "name", "") in ["ADMIN", "SUPER_ADMIN"]

    returned_map = {}

    # 1. Fetch returned UFM Cases
    ufm_results = (
        db.query(
            UFMCase,
            AnswerScript,
        )
        .join(
            AnswerScript,
            UFMCase.answer_script_id == AnswerScript.id,
        )
        .filter(
            (UFMCase.status == "RETURNED_TO_EXAMINER") |
            (AnswerScript.status == "RETURNED_TO_EXAMINER")
        )
        .order_by(UFMCase.reviewed_at.desc(), UFMCase.reported_at.desc())
        .all()
    )

    for ufm, script in ufm_results:
        if ufm.status != "RETURNED_TO_EXAMINER" and script.status != "RETURNED_TO_EXAMINER":
            continue

        barcode = script.barcode
        admin_note = (
            ufm.admin_remarks.strip()
            if (ufm.admin_remarks and ufm.admin_remarks.strip())
            else (ufm.system_message or "Returned by Admin for re-evaluation")
        )

        returned_map[barcode] = {
            "id": str(script.id),
            "rejectionId": str(ufm.id),
            "rejection_id": str(ufm.id),
            "ufm_id": str(ufm.id),
            "barcode": barcode,
            "subject": script.subject or "General Evaluation",
            "subjectCode": barcode,
            "version": "V1",
            "reason": ufm.reason or "Suspected Unfair Means",
            "adminRemarks": admin_note,
            "admin_remarks": admin_note,
            "status": "Returned to Examiner",
            "displayStatus": "Returned to Examiner",
            "file_url": f"/api/v1/admin/ufm-cases/{ufm.id}/preview",
            "rejected_at": ufm.reviewed_at.isoformat() if ufm.reviewed_at else (ufm.reported_at.isoformat() if ufm.reported_at else None),
            "type": "UFM",
            "assigned_examiner_id": str(script.assigned_examiner_id) if script.assigned_examiner_id else None,
            "reported_by_examiner_id": str(ufm.reported_by_examiner_id) if ufm.reported_by_examiner_id else None,
        }

    # 2. Fetch returned Script Rejections
    rej_results = (
        db.query(
            ScriptRejection,
            AnswerScript,
            AdminReviewAction,
        )
        .join(
            AnswerScript,
            ScriptRejection.answer_script_id == AnswerScript.id,
        )
        .outerjoin(
            AdminReviewAction,
            AdminReviewAction.rejection_id == ScriptRejection.id,
        )
        .filter(
            (AnswerScript.status == "RETURNED_TO_EXAMINER") |
            (ScriptRejection.status == "RETURNED_TO_EXAMINER")
        )
        .order_by(ScriptRejection.rejected_at.desc())
        .all()
    )

    for rej, script, review in rej_results:
        if rej.status != "RETURNED_TO_EXAMINER" and script.status != "RETURNED_TO_EXAMINER":
            continue

        barcode = script.barcode
        admin_note = (
            review.admin_remarks.strip()
            if (review and review.admin_remarks and review.admin_remarks.strip())
            else "Returned by Admin for re-evaluation"
        )

        if barcode in returned_map:
            existing = returned_map[barcode]
            if existing["adminRemarks"] in ["Returned by Admin for re-evaluation", "UFM NOT FOUND. Continue Evaluation"] and admin_note != "Returned by Admin for re-evaluation":
                existing["adminRemarks"] = admin_note
                existing["admin_remarks"] = admin_note
        else:
            returned_map[barcode] = {
                "id": str(script.id),
                "rejectionId": str(rej.id),
                "rejection_id": str(rej.id),
                "ufm_id": None,
                "barcode": barcode,
                "subject": script.subject or "General Evaluation",
                "subjectCode": barcode,
                "version": "V1",
                "reason": rej.reason or "Script Rejection",
                "adminRemarks": admin_note,
                "admin_remarks": admin_note,
                "status": "Returned to Examiner",
                "displayStatus": "Returned to Examiner",
                "file_url": f"/api/v1/admin/rejected-scripts/{rej.id}/preview",
                "rejected_at": rej.rejected_at.isoformat() if rej.rejected_at else None,
                "type": "REJECTION",
                "assigned_examiner_id": str(script.assigned_examiner_id) if script.assigned_examiner_id else None,
                "reported_by_examiner_id": str(rej.rejected_by_examiner_id) if rej.rejected_by_examiner_id else None,
            }

    # 3. Direct AnswerScripts with RETURNED_TO_EXAMINER
    direct_scripts = (
        db.query(AnswerScript)
        .filter(AnswerScript.status == "RETURNED_TO_EXAMINER")
        .all()
    )
    for script in direct_scripts:
        if script.barcode not in returned_map:
            returned_map[script.barcode] = {
                "id": str(script.id),
                "rejectionId": str(script.id),
                "rejection_id": str(script.id),
                "ufm_id": None,
                "barcode": script.barcode,
                "subject": script.subject or "General Evaluation",
                "subjectCode": script.barcode,
                "version": "V1",
                "reason": "Returned for re-evaluation",
                "adminRemarks": "Returned by Admin for re-evaluation",
                "admin_remarks": "Returned by Admin for re-evaluation",
                "status": "Returned to Examiner",
                "displayStatus": "Returned to Examiner",
                "file_url": f"/api/v1/uploader/scanned-documents/by-barcode/{script.barcode}/preview",
                "rejected_at": None,
                "type": "GENERAL",
                "assigned_examiner_id": str(script.assigned_examiner_id) if script.assigned_examiner_id else None,
                "reported_by_examiner_id": None,
            }

    examiner_id_str = str(examiner.id) if hasattr(examiner, "id") else None
    examiner_code = (getattr(examiner, "user_id", "") or "").lower()

    assigned_to_me = []
    others = []

    for item in returned_map.values():
        is_mine = False
        if is_admin:
            is_mine = True
        elif examiner_id_str:
            if item["assigned_examiner_id"] == examiner_id_str or item["reported_by_examiner_id"] == examiner_id_str:
                is_mine = True
            elif item["assigned_examiner_id"]:
                assigned_user = db.scalar(select(User).where(User.id == item["assigned_examiner_id"]))
                if assigned_user and assigned_user.user_id.lower() == examiner_code:
                    is_mine = True

        if is_mine:
            assigned_to_me.append(item)
        else:
            others.append(item)

    # Return all returned scripts in the queue with directly assigned scripts sorted first
    return assigned_to_me + others
