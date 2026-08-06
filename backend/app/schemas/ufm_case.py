from datetime import datetime
from pydantic import BaseModel, Field


class ReportUFMRequest(BaseModel):
    barcode: str
    reason: str = Field(..., min_length=2, max_length=100)
    examiner_remarks: str | None = None


class UFMCaseResponse(BaseModel):
    ufm_id: str
    answer_script_id: str
    barcode: str
    subject: str
    centre_id: str
    examiner_id: str
    reason: str
    examiner_remarks: str | None = None
    file_path: str
    status: str  # PENDING_ADMIN_REVIEW, UFM_CONFIRMED, RETURNED_TO_EXAMINER
    reported_at: datetime

    review_decision: str | None = None  # CONFIRM_UFM, RETURN_TO_EXAMINER
    admin_remarks: str | None = None
    system_message: str | None = None
    reviewed_at: datetime | None = None

    class Config:
        from_attributes = True


class UFMReviewDecisionRequest(BaseModel):
    decision: str = Field(..., description="CONFIRM_UFM or RETURN_TO_EXAMINER")
    remarks: str | None = None
