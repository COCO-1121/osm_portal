from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    id: str
    admin_id: str
    admin_name: str
    action: str
    target: str
    timestamp: str

    class Config:
        from_attributes = True
