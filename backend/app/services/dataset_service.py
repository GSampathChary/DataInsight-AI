import os
import uuid
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from app.config.config import UPLOADS_DIR, DATASETS_DIR
from app.core.database import save_dataset_meta, get_dataset_by_id

def load_dataframe(filepath: str) -> pd.DataFrame:
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {filepath}")
    
    if path.suffix.lower() in ['.csv']:
        # Attempt to auto-detect separator if default comma fails
        try:
            df = pd.read_csv(filepath)
        except Exception:
            df = pd.read_csv(filepath, sep=';')
    elif path.suffix.lower() in ['.xlsx', '.xls']:
        df = pd.read_excel(filepath)
    else:
        raise ValueError(f"Unsupported file format: {path.suffix}")
    
    return df

def save_uploaded_file(file_content: bytes, original_filename: str) -> Dict[str, Any]:
    dataset_id = str(uuid.uuid4())
    suffix = Path(original_filename).suffix.lower()
    saved_filename = f"{dataset_id}{suffix}"
    filepath = str(UPLOADS_DIR / saved_filename)
    
    with open(filepath, "wb") as f:
        f.write(file_content)
        
    df = load_dataframe(filepath)
    rows, cols = df.shape
    file_size = len(file_content)
    
    save_dataset_meta(
        dataset_id=dataset_id,
        filename=original_filename,
        filepath=filepath,
        file_type=suffix,
        file_size=file_size,
        rows_count=rows,
        cols_count=cols
    )
    
    return {
        "id": dataset_id,
        "filename": original_filename,
        "filepath": filepath,
        "rows": rows,
        "columns": cols,
        "file_size": file_size,
        "file_type": suffix
    }

def get_dataset_preview(dataset_id: str, limit: int = 10) -> Dict[str, Any]:
    meta = get_dataset_by_id(dataset_id)
    if not meta:
        raise ValueError("Dataset not found")
    
    df = load_dataframe(meta['filepath'])
    # Replace NaN with None for JSON serialization
    df_clean = df.head(limit).replace({np.nan: None})
    
    dtypes = {col: str(df[col].dtype) for col in df.columns}
    missing = {col: int(df[col].isnull().sum()) for col in df.columns}
    
    return {
        "metadata": meta,
        "columns": list(df.columns),
        "dtypes": dtypes,
        "missing_counts": missing,
        "preview": df_clean.to_dict(orient="records")
    }
