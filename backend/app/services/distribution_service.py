import logging
from sqlalchemy.orm import Session
from app.models.uploader.scanned_document import ScannedDocument
from app.models.user import User

logger = logging.getLogger(__name__)

def distribute_unassigned_copies(db: Session):
    """
    Distribute unassigned scanned documents equally among active examiners.
    """
    # 1. Fetch unassigned copies that are uploaded
    unassigned_copies = db.query(ScannedDocument).filter(
        ScannedDocument.assigned_examiner_id == None,
        ScannedDocument.status == "Uploaded"
    ).all()

    if not unassigned_copies:
        return 0

        # 2. Fetch all active examiners (by joining the Role table)
    from app.models.role import Role

    examiners = db.query(User).join(Role, User.role_id == Role.id).filter(
        Role.name.ilike("%examiner%"),
        User.is_active == True
    ).all()

    if not examiners:
        logger.warning("No active examiners found for copy distribution.")
        return 0

    # 3. Distribute round-robin equally
    assigned_count = 0
    num_examiners = len(examiners)
    
    for i, copy in enumerate(unassigned_copies):
        examiner = examiners[i % num_examiners]
        copy.assigned_examiner_id = examiner.id
        copy.status = "ASSIGNED"
        assigned_count += 1

    db.commit()
    logger.info(f"Distributed {assigned_count} copies among {num_examiners} examiners.")
    return assigned_count
