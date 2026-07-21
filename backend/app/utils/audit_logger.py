from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User


def create_audit_log(
    db: Session,
    admin: User,
    action: str,
    target: str,
):
    """Create an audit log entry for an admin action."""
    audit_log = AuditLog(
        admin_id=admin.id,
        action=action,
        target=target,
    )
    db.add(audit_log)
    db.commit()
