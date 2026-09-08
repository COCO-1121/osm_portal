import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class AdminRejectedScriptResponse(BaseModel):
    rejection_id: uuid.UUID
    answer_script_id: uuid.UUID

    barcode: str
    subject: str
    centre_id: str

    examiner_id: str
    rejection_reason: str
    examiner_remarks: str | None

    file_path: str
    file_url: str | None = None
    total_pages: int | None = None

    status: str
    rejected_at: datetime

    # Admin review details
    review_decision: str | None = None
    admin_remarks: str | None = None
    system_message: str | None = None
    reviewed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class AdminReviewDecisionRequest(BaseModel):
    decision: Literal[
        "RETURN_TO_UPLOADER",
        "RETURN_TO_EXAMINER",
    ]

    remarks: str | None = None