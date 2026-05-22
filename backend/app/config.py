import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Career Guidance Portal API"
    
    # Database
    # Fallback to local SQLite file for ease of local testing and zero-setup startup.
    # On Render, this will be overridden by the DATABASE_URL environment variable.
    # We dynamically normalize 'postgres://' to 'postgresql://' as required by SQLAlchemy 2.x
    db_url = os.getenv("DATABASE_URL", "sqlite:///./career_portal.db")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    DATABASE_URL: str = db_url
    
    # JWT Configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    class Config:
        case_sensitive = True

settings = Settings()
