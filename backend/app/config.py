import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Next-Gen AI Talent Intelligence Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # LLM Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    FALLBACK_GROQ_MODEL: str = "llama-3.1-8b-instant"
    LEGACY_GROQ_MODEL: str = "openai/gpt-oss-120b"
    
    # Host & CORS
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "*"
    ]
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: set[str] = {".pdf", ".docx", ".txt"}

settings = Settings()
