import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class LoginHistoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    ip_address: Optional[str]
    browser: Optional[str]
    device: Optional[str]
    login_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedLoginHistoryResponse(BaseModel):
    items: List[LoginHistoryResponse]
    total: int
    page: int
    size: int
    pages: int
