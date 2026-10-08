import os
from pathlib import Path
from dotenv import load_dotenv

# Load root .env file
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or ""
    GEMINI_MODEL = os.getenv("AI_MODEL", "gemini-3.5-flash")
    if GEMINI_MODEL in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini"]:
        GEMINI_MODEL = "gemini-3.5-flash"
    elif "gemini" not in GEMINI_MODEL.lower():
        GEMINI_MODEL = "gemini-3.5-flash"

    # Database settings
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "asset_management_db")

    # Agent Server settings
    PORT = int(os.getenv("PYTHON_AGENT_PORT", "5050"))

config = Config()
