from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetMeta(BaseModel):
    id: str
    filename: str
    filepath: str
    file_type: str
    file_size: int
    rows_count: Optional[int] = 0
    cols_count: Optional[int] = 0
    created_at: Optional[str] = None

class DataCleaningRequest(BaseModel):
    dataset_id: str
    missing_strategy: str = "drop" # drop, mean, median, mode, fill_zero
    fill_value: Optional[str] = None
    remove_duplicates: bool = True
    columns_to_drop: List[str] = []

class EDARequest(BaseModel):
    dataset_id: str

class TrainMLRequest(BaseModel):
    dataset_id: str
    target_column: str
    task_type: str = "auto" # auto, classification, regression
    features: Optional[List[str]] = None
    test_size: float = 0.2
    random_state: int = 42

class AIInsightsRequest(BaseModel):
    dataset_id: str
    prompt_type: str = "general" # general, executive, anomalies, recommendations
    custom_question: Optional[str] = None
    api_key: Optional[str] = None

class ModelDownloadResponse(BaseModel):
    model_id: str
    filename: str
    download_url: str
