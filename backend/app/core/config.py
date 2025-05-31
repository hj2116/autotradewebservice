from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Auto Trader API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Upbit API 설정
    UPBIT_ACCESS_KEY: str
    UPBIT_SECRET_KEY: str
    
    # 데이터베이스 설정
    DATABASE_URL: Optional[str] = "sqlite:///./trading.db"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 