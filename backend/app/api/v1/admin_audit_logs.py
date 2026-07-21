from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse
from app.core.dependencies import require_admin


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Audit Logs"],
)


@router.get(
    "/audit-logs",
    response_model=list[AuditLogResponse],
)
def get_audit_logs(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Retrieve all audit logs for the current admin."""
    audit_logs = (
        db.query(AuditLog)
        .filter(
            AuditLog.admin_id == current_admin.id,
        )
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    return [
        AuditLogResponse(
            id=str(log.id),
            admin_id=str(log.admin_id),
            admin_name=log.admin.name if log.admin else "Unknown",
            action=log.action,
            target=log.target,
            timestamp=log.timestamp.isoformat(),
        )
        for log in audit_logs
    ]
