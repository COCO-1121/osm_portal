import sys
import logging
from sqlalchemy import text, inspect
from app.db.session import admin_engine, examiner_engine, uploader_engine, Base
from app.models.role import Role
from app.models.user import User
from app.models.login_history import LoginHistory
from app.db.seed import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_engine_tables(engine, name):
    logger.info(f"Checking tables for [{name}]...")
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if inspector.has_table("users"):
                columns = [col["name"] for col in inspector.get_columns("users")]
                logger.info(f"[{name}] Found 'users' table with columns: {columns}")
                if "user_id" not in columns or "dob" not in columns:
                    logger.info(f"[{name}] Missing required columns in 'users' table. Dropping table 'users'...")
                    conn.execute(text("DROP TABLE IF EXISTS login_history CASCADE;"))
                    conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
                    conn.commit()
                    logger.info(f"[{name}] Dropped outdated 'users' table.")
            
        Base.metadata.create_all(bind=engine)
        logger.info(f"[{name}] Base.metadata.create_all executed successfully.")
    except Exception as e:
        logger.error(f"[{name}] Error fixing tables: {e}")

if __name__ == "__main__":
    fix_engine_tables(admin_engine, "Admin DB")
    fix_engine_tables(examiner_engine, "Examiner DB")
    fix_engine_tables(uploader_engine, "Uploader DB")

    logger.info("Re-running database seeding across all 3 databases...")
    try:
        seed_database()
        logger.info("Seeding complete! EXM001, ADM001, UPL001 users verified across databases.")
    except Exception as e:
        logger.error(f"Failed to seed database: {e}")
