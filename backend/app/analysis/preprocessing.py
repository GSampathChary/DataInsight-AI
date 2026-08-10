import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Tuple
from app.services.dataset_service import load_dataframe
from app.config.config import UPLOADS_DIR

def clean_dataset(
    filepath: str,
    missing_strategy: str = "drop",
    fill_value: str = None,
    remove_duplicates: bool = True,
    columns_to_drop: List[str] = []
) -> Tuple[str, Dict[str, Any]]:
    df = load_dataframe(filepath)
    original_shape = df.shape

    # 1. Drop requested columns
    if columns_to_drop:
        existing_cols = [c for c in columns_to_drop if c in df.columns]
        df = df.drop(columns=existing_cols)

    # 2. Remove duplicates
    duplicates_removed = 0
    if remove_duplicates:
        dup_count = df.duplicated().sum()
        df = df.drop_duplicates()
        duplicates_removed = int(dup_count)

    # 3. Handle missing values
    missing_before = int(df.isnull().sum().sum())
    
    if missing_strategy == "drop":
        df = df.dropna()
    elif missing_strategy == "mean":
        num_cols = df.select_dtypes(include=[np.number]).columns
        df[num_cols] = df[num_cols].fillna(df[num_cols].mean())
    elif missing_strategy == "median":
        num_cols = df.select_dtypes(include=[np.number]).columns
        df[num_cols] = df[num_cols].fillna(df[num_cols].median())
    elif missing_strategy == "mode":
        for col in df.columns:
            if df[col].isnull().sum() > 0:
                mode_val = df[col].mode()
                if not mode_val.empty:
                    df[col] = df[col].fillna(mode_val[0])
    elif missing_strategy == "fill_zero":
        df = df.fillna(0)
    elif missing_strategy == "custom" and fill_value is not None:
        df = df.fillna(fill_value)

    missing_after = int(df.isnull().sum().sum())

    # Save cleaned file
    cleaned_path = str(Path(filepath).parent / f"cleaned_{Path(filepath).name}")
    if Path(filepath).suffix.lower() == ".csv":
        df.to_csv(cleaned_path, index=False)
    else:
        df.to_excel(cleaned_path, index=False)

    stats_summary = {
        "original_shape": list(original_shape),
        "cleaned_shape": list(df.shape),
        "duplicates_removed": duplicates_removed,
        "missing_before": missing_before,
        "missing_after": missing_after,
        "cleaned_filepath": cleaned_path
    }

    return cleaned_path, stats_summary
