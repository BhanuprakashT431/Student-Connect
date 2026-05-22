import os
from pydantic_settings import BaseSettings

# Fetch and dynamically normalize 'postgres://' to 'postgresql://' outside the Settings class
# to prevent Pydantic 2.x from treating 'db_url' as a non-annotated model attribute.
_db_url = os.getenv("DATABASE_URL", "sqlite:///./career_portal.db")
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Career Guidance Portal API"
    DATABASE_URL: str = _db_url
    
    # JWT Configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    class Config:
        case_sensitive = True

settings = Settings()
