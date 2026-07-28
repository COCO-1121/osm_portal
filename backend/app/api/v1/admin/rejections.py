from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.answer_script import AnswerScript
from app.models.script_rejection import ScriptRejection
from app.models.user import User
from app.models.admin_review_action import AdminReviewAction
from app.schemas.admin_rejection import (
    AdminRejectedScriptResponse,
    AdminReviewDecisionRequest,
)
from app.core.dependencies import require_admin
from app.utils.audit_logger import create_audit_log


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"],
)


@router.get(
    "/rejected-scripts",
    response_model=list[AdminRejectedScriptResponse],
)
def get_rejected_scripts(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    results = (
        db.query(
            ScriptRejection,
            AnswerScript,
            User,
        )
        .join(
            AnswerScript,
            ScriptRejection.answer_script_id == AnswerScript.id,
        )
        .join(
            User,
            ScriptRejection.rejected_by_examiner_id == User.id,
        )
        .order_by(ScriptRejection.rejected_at.desc())
        .all()
    )

    response = []

    for rejection, script, examiner in results:

        # Fetch admin review details if this rejection
        # has already been reviewed
        review_action = (
            db.query(AdminReviewAction)
            .filter(
                AdminReviewAction.rejection_id == rejection.id
            )
            .first()
        )

        response.append(
            AdminRejectedScriptResponse(
                rejection_id=rejection.id,
                answer_script_id=script.id,
                barcode=script.barcode,
                subject=script.subject,
                centre_id=script.centre_id,
                examiner_id=examiner.user_id,
                rejection_reason=rejection.reason,
                examiner_remarks=rejection.examiner_remarks,
                file_path=script.file_path,
                status=rejection.status,
                rejected_at=rejection.rejected_at,

                # Actual admin review details
                review_decision=(
                    review_action.decision
                    if review_action
                    else None
                ),
                admin_remarks=(
                    review_action.admin_remarks
                    if review_action
                    else None
                ),
                system_message=(
                    review_action.system_message
                    if review_action
                    else None
                ),
                reviewed_at=(
                    review_action.reviewed_at
                    if review_action
                    else None
                ),
            )
        )

    return response


@router.get(
    "/rejected-scripts/{rejection_id}",
    response_model=AdminRejectedScriptResponse,
)
def get_rejected_script_by_id(
    rejection_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    result = (
        db.query(
            ScriptRejection,
            AnswerScript,
            User,
        )
        .join(
            AnswerScript,
            ScriptRejection.answer_script_id == AnswerScript.id,
        )
        .join(
            User,
            ScriptRejection.rejected_by_examiner_id == User.id,
        )
        .filter(
            ScriptRejection.id == rejection_id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rejected script not found",
        )

    rejection, script, examiner = result

    # Fetch the saved admin review action, if the script
    # has already been reviewed.
    review_action = (
        db.query(AdminReviewAction)
        .filter(
            AdminReviewAction.rejection_id == rejection.id
        )
        .first()
    )

    return AdminRejectedScriptResponse(
        rejection_id=rejection.id,
        answer_script_id=script.id,
        barcode=script.barcode,
        subject=script.subject,
        centre_id=script.centre_id,
        examiner_id=examiner.user_id,
        rejection_reason=rejection.reason,
        examiner_remarks=rejection.examiner_remarks,
        file_path=script.file_path,
        status=rejection.status,
        rejected_at=rejection.rejected_at,

        # Admin review details
        review_decision=(
            review_action.decision
            if review_action
            else None
        ),
        admin_remarks=(
            review_action.admin_remarks
            if review_action
            else None
        ),
        system_message=(
            review_action.system_message
            if review_action
            else None
        ),
        reviewed_at=(
            review_action.reviewed_at
            if review_action
            else None
        ),
    )


@router.post(
    "/rejected-scripts/{rejection_id}/decision",
    status_code=status.HTTP_200_OK,
)
def submit_admin_review_decision(
    rejection_id: str,
    payload: AdminReviewDecisionRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    result = (
        db.query(
            ScriptRejection,
            AnswerScript,
        )
        .join(
            AnswerScript,
            ScriptRejection.answer_script_id == AnswerScript.id,
        )
        .filter(
            ScriptRejection.id == rejection_id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rejected script not found",
        )

    rejection, script = result

    # Prevent the same rejected script from being reviewed twice
    existing_review = (
        db.query(AdminReviewAction)
        .filter(
            AdminReviewAction.rejection_id == rejection.id
        )
        .first()
    )

    if existing_review is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This rejected script has already been reviewed.",
        )

    # Process admin decision
    if payload.decision == "RETURN_TO_EXAMINER":
        new_status = "RETURNED_TO_EXAMINER"

        # Return the script to the same examiner who rejected it
        script.assigned_examiner_id = (
            rejection.rejected_by_examiner_id
        )

        system_message = (
            "All pages verified. Continue evaluation."
        )

    elif payload.decision == "RETURN_TO_UPLOADER":
        new_status = "RETURNED_TO_UPLOADER"

        # Remove the script from the examiner's assignment
        script.assigned_examiner_id = None

        system_message = (
            "Script returned to uploader for re-upload."
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review decision",
        )

    # Update rejection and answer script status
    rejection.status = new_status
    script.status = new_status

    # Save admin review history
    review_action = AdminReviewAction(
        rejection_id=rejection.id,
        reviewed_by_admin_id=current_admin.id,
        decision=payload.decision,
        admin_remarks=payload.remarks,
        system_message=system_message,
    )

    db.add(review_action)
    db.commit()

    # Log the action
    create_audit_log(
        db=db,
        admin=current_admin,
        action="Returned Script",
        target=script.barcode,
    )

    return {
        "message": "Review decision submitted successfully",
        "rejection_id": str(rejection.id),
        "decision": payload.decision,
        "status": new_status,
    }