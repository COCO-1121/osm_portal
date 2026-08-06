from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.answer_script import AnswerScript
from app.models.ufm_case import UFMCase
from app.models.user import User
from app.schemas.ufm_case import (
    UFMCaseResponse,
    UFMReviewDecisionRequest,
)
from app.core.dependencies import require_admin
from app.utils.audit_logger import create_audit_log


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin UFM Cases"],
)


@router.get(
    "/ufm-cases",
    response_model=list[UFMCaseResponse],
)
def get_ufm_cases(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    results = (
        db.query(
            UFMCase,
            AnswerScript,
            User,
        )
        .join(
            AnswerScript,
            UFMCase.answer_script_id == AnswerScript.id,
        )
        .join(
            User,
            UFMCase.reported_by_examiner_id == User.id,
        )
        .order_by(UFMCase.reported_at.desc())
        .all()
    )

    response = []

    for ufm, script, examiner in results:
        response.append(
            UFMCaseResponse(
                ufm_id=str(ufm.id),
                answer_script_id=str(script.id),
                barcode=script.barcode,
                subject=script.subject,
                centre_id=script.centre_id,
                examiner_id=examiner.user_id,
                reason=ufm.reason,
                examiner_remarks=ufm.examiner_remarks,
                file_path=script.file_path,
                status=ufm.status,
                reported_at=ufm.reported_at,
                review_decision=ufm.review_decision,
                admin_remarks=ufm.admin_remarks,
                system_message=ufm.system_message,
                reviewed_at=ufm.reviewed_at,
            )
        )

    return response


@router.get(
    "/ufm-cases/{ufm_id}",
    response_model=UFMCaseResponse,
)
def get_ufm_case_by_id(
    ufm_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    result = (
        db.query(
            UFMCase,
            AnswerScript,
            User,
        )
        .join(
            AnswerScript,
            UFMCase.answer_script_id == AnswerScript.id,
        )
        .join(
            User,
            UFMCase.reported_by_examiner_id == User.id,
        )
        .filter(
            UFMCase.id == ufm_id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UFM Case not found.",
        )

    ufm, script, examiner = result

    return UFMCaseResponse(
        ufm_id=str(ufm.id),
        answer_script_id=str(script.id),
        barcode=script.barcode,
        subject=script.subject,
        centre_id=script.centre_id,
        examiner_id=examiner.user_id,
        reason=ufm.reason,
        examiner_remarks=ufm.examiner_remarks,
        file_path=script.file_path,
        status=ufm.status,
        reported_at=ufm.reported_at,
        review_decision=ufm.review_decision,
        admin_remarks=ufm.admin_remarks,
        system_message=ufm.system_message,
        reviewed_at=ufm.reviewed_at,
    )


@router.post(
    "/ufm-cases/{ufm_id}/decision",
    status_code=status.HTTP_200_OK,
)
def submit_ufm_review_decision(
    ufm_id: str,
    payload: UFMReviewDecisionRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    result = (
        db.query(
            UFMCase,
            AnswerScript,
        )
        .join(
            AnswerScript,
            UFMCase.answer_script_id == AnswerScript.id,
        )
        .filter(
            UFMCase.id == ufm_id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="UFM Case not found.",
        )

    ufm, script = result

    if ufm.status != "PENDING_ADMIN_REVIEW":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This UFM case has already been reviewed.",
        )

    if payload.decision == "CONFIRM_UFM":
        new_status = "UFM_CONFIRMED"
        system_message = "Paper cancelled. Marks = 0"
        action_name = "Confirmed UFM"
    elif payload.decision == "RETURN_TO_EXAMINER":
        new_status = "RETURNED_TO_EXAMINER"
        system_message = "UFM NOT FOUND. Continue Evaluation"
        action_name = "Returned UFM Case"
        # Re-assign script to original examiner
        script.assigned_examiner_id = ufm.reported_by_examiner_id
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UFM decision value.",
        )

    ufm.status = new_status
    ufm.review_decision = payload.decision
    ufm.admin_remarks = payload.remarks
    ufm.system_message = system_message
    ufm.reviewed_by_admin_id = current_admin.id
    ufm.reviewed_at = datetime.now(timezone.utc)

    script.status = new_status

    db.commit()

    # Log audit event
    create_audit_log(
        db=db,
        admin=current_admin,
        action=action_name,
        target=script.barcode,
    )

    return {
        "message": "UFM review decision submitted successfully",
        "ufm_id": str(ufm.id),
        "decision": payload.decision,
        "status": new_status,
    }
