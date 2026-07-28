from app.db.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS login_histories CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS users CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS roles CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE;'))
    conn.commit()

