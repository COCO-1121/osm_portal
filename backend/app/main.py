from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine

app = FastAPI(
    title="OSM Portal API",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "OSM Backend Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def db_test():

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {
            "database": "Connected Successfully ✅"
        }

    except Exception as e:
        return {
            "database": "Connection Failed ❌",
            "error": str(e)
        }