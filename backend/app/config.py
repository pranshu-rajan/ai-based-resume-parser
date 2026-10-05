import os
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Search for .env file in root directory and backend directory
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = Path(__file__).resolve().parent.parent
if (root_dir / ".env").exists():
    load_dotenv(dotenv_path=root_dir / ".env", override=False)
if (backend_dir / ".env").exists():
    load_dotenv(dotenv_path=backend_dir / ".env", override=False)
load_dotenv(find_dotenv(usecwd=True), override=False)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Next-Gen AI Talent Intelligence Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # LLM Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    FALLBACK_GROQ_MODEL: str = "llama-3.3-70b-versatile"
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
