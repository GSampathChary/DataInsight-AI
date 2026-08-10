import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
MODELS_DIR = UPLOADS_DIR / "models"
DATASETS_DIR = BASE_DIR / "datasets"
REPORTS_DIR = BASE_DIR / "reports"
LOGS_DIR = BASE_DIR / "logs"
DB_PATH = BASE_DIR / "datainsight.db"

# Create directories if not exist
for path in [UPLOADS_DIR, MODELS_DIR, DATASETS_DIR, REPORTS_DIR, LOGS_DIR]:
    os.makedirs(path, exist_ok=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MAX_UPLOAD_SIZE_MB = 50
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
