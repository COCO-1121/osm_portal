from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import Base, engine
from app.models.user import User
from app.api.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OSM Backend API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register the authentication routes
app.include_router(auth_router, tags=["Authentication"])


@app.get("/")
def root():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "message": "Database Connected Successfully!"
    }