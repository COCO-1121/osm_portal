import logging
from sqlalchemy import text, inspect
from app.db.session import admin_engine, examiner_engine, uploader_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_dob_column(engine, name):
    logger.info(f"Adding dob column if missing for [{name}]...")
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if inspector.has_table("users"):
                columns = [col["name"] for col in inspector.get_columns("users")]
                if "dob" not in columns:
                    logger.info(f"[{name}] Adding 'dob' column to 'users' table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN dob VARCHAR(20);"))
                    conn.commit()
                    logger.info(f"[{name}] Successfully added 'dob' column.")
                else:
                    logger.info(f"[{name}] 'dob' column already exists.")
    except Exception as e:
        logger.error(f"[{name}] Error adding dob column: {e}")

if __name__ == "__main__":
    add_dob_column(admin_engine, "Admin DB")
    add_dob_column(examiner_engine, "Examiner DB")
    add_dob_column(uploader_engine, "Uploader DB")
