import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.services.dataset_service import load_dataframe

def perform_eda(filepath: str) -> Dict[str, Any]:
    df = load_dataframe(filepath)
    
    total_rows, total_cols = df.shape
    num_cols = list(df.select_dtypes(include=[np.number]).columns)
    cat_cols = list(df.select_dtypes(include=['object', 'category', 'bool']).columns)
    
    # 1. Column Metadata
    columns_info = []
    for col in df.columns:
        col_series = df[col]
        missing_count = int(col_series.isnull().sum())
        missing_pct = round((missing_count / total_rows) * 100, 2) if total_rows > 0 else 0
        unique_count = int(col_series.nunique())
        
        info = {
            "name": col,
            "dtype": str(col_series.dtype),
            "is_numeric": col in num_cols,
            "missing_count": missing_count,
            "missing_percentage": missing_pct,
            "unique_count": unique_count,
            "sample_values": col_series.dropna().head(5).tolist()
        }
        columns_info.append(info)

    # 2. Descriptive Statistics for Numeric Columns
    descriptive_stats = {}
    if num_cols:
        desc_df = df[num_cols].describe().T
        desc_df['skewness'] = df[num_cols].skew()
        desc_df['kurtosis'] = df[num_cols].kurtosis()
        desc_df['median'] = df[num_cols].median()
        
        for col in num_cols:
            descriptive_stats[col] = {
                "count": float(desc_df.loc[col, "count"]),
                "mean": round(float(desc_df.loc[col, "mean"]), 4) if pd.notnull(desc_df.loc[col, "mean"]) else None,
                "std": round(float(desc_df.loc[col, "std"]), 4) if pd.notnull(desc_df.loc[col, "std"]) else None,
                "min": round(float(desc_df.loc[col, "min"]), 4) if pd.notnull(desc_df.loc[col, "min"]) else None,
                "q25": round(float(desc_df.loc[col, "25%"]), 4) if pd.notnull(desc_df.loc[col, "25%"]) else None,
                "median": round(float(desc_df.loc[col, "median"]), 4) if pd.notnull(desc_df.loc[col, "median"]) else None,
                "q75": round(float(desc_df.loc[col, "75%"]), 4) if pd.notnull(desc_df.loc[col, "75%"]) else None,
                "max": round(float(desc_df.loc[col, "max"]), 4) if pd.notnull(desc_df.loc[col, "max"]) else None,
                "skewness": round(float(desc_df.loc[col, "skewness"]), 4) if pd.notnull(desc_df.loc[col, "skewness"]) else None,
                "kurtosis": round(float(desc_df.loc[col, "kurtosis"]), 4) if pd.notnull(desc_df.loc[col, "kurtosis"]) else None,
            }

    # 3. Correlation Matrix (Numeric)
    correlation_matrix = {}
    if len(num_cols) > 1:
        corr = df[num_cols].corr().fillna(0)
        correlation_matrix = {
            "columns": num_cols,
            "values": [[round(float(corr.loc[r, c]), 4) for c in num_cols] for r in num_cols]
        }

    # 4. Outlier Analysis (IQR Method)
    outliers_summary = {}
    for col in num_cols:
        series = df[col].dropna()
        if len(series) > 0:
            q25 = series.quantile(0.25)
            q75 = series.quantile(0.75)
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            outlier_count = int(((series < lower_bound) | (series > upper_bound)).sum())
            outliers_summary[col] = {
                "count": outlier_count,
                "percentage": round((outlier_count / len(series)) * 100, 2),
                "lower_bound": round(float(lower_bound), 4),
                "upper_bound": round(float(upper_bound), 4)
            }

    # 5. Missing Values & Duplicate Overview
    total_missing = int(df.isnull().sum().sum())
    total_cells = total_rows * total_cols
    missing_pct_overall = round((total_missing / total_cells) * 100, 2) if total_cells > 0 else 0
    duplicate_rows = int(df.duplicated().sum())

    # Calculate overall dataset health score (0-100)
    health_score = max(0, 100 - (missing_pct_overall * 1.5 + (duplicate_rows / total_rows * 20 if total_rows else 0)))
    health_score = round(health_score, 1)

    return {
        "summary": {
            "rows": total_rows,
            "columns": total_cols,
            "numeric_columns_count": len(num_cols),
            "categorical_columns_count": len(cat_cols),
            "total_missing_values": total_missing,
            "missing_percentage": missing_pct_overall,
            "duplicate_rows": duplicate_rows,
            "health_score": health_score
        },
        "columns_info": columns_info,
        "numeric_columns": num_cols,
        "categorical_columns": cat_cols,
        "descriptive_stats": descriptive_stats,
        "correlation_matrix": correlation_matrix,
        "outliers_summary": outliers_summary
    }

def get_visualization_data(filepath: str, col_x: str = None, col_y: str = None, chart_type: str = "histogram") -> Dict[str, Any]:
    df = load_dataframe(filepath)
    num_cols = list(df.select_dtypes(include=[np.number]).columns)
    cat_cols = list(df.select_dtypes(include=['object', 'category', 'bool']).columns)
    
    # Pick defaults if not provided
    if not col_x:
        col_x = num_cols[0] if num_cols else (df.columns[0] if len(df.columns) > 0 else "")
    if not col_y and len(num_cols) > 1:
        col_y = num_cols[1] if num_cols[0] == col_x else num_cols[0]

    result = {
        "chart_type": chart_type,
        "col_x": col_x,
        "col_y": col_y,
        "data": []
    }

    if not col_x or col_x not in df.columns:
        return result

    if chart_type == "histogram":
        series = df[col_x].dropna()
        if col_x in num_cols:
            counts, bin_edges = np.histogram(series, bins=15)
            data = []
            for i in range(len(counts)):
                label = f"{round(bin_edges[i], 2)}-{round(bin_edges[i+1], 2)}"
                data.append({"bin": label, "count": int(counts[i])})
            result["data"] = data
        else:
            vc = series.value_counts().head(15)
            result["data"] = [{"bin": str(k), "count": int(v)} for k, v in vc.items()]

    elif chart_type in ["bar", "pie"]:
        series = df[col_x].dropna()
        vc = series.value_counts().head(10)
        result["data"] = [{"name": str(k), "value": int(v)} for k, v in vc.items()]

    elif chart_type == "scatter":
        if col_x in df.columns and col_y and col_y in df.columns:
            clean_sub = df[[col_x, col_y]].dropna().head(300)
            result["data"] = [
                {"x": float(row[col_x]), "y": float(row[col_y])}
                for _, row in clean_sub.iterrows()
                if pd.notnull(row[col_x]) and pd.notnull(row[col_y])
            ]

    elif chart_type == "line":
        sub = df[[col_x]].dropna().head(200).reset_index()
        if col_y and col_y in df.columns:
            sub = df[[col_x, col_y]].dropna().head(200).reset_index()
            result["data"] = [
                {"index": i, "x": str(row[col_x]), "y": float(row[col_y])}
                for i, row in sub.iterrows()
            ]
        else:
            result["data"] = [
                {"index": i, "y": float(row[col_x])}
                for i, row in sub.iterrows()
            ]

    elif chart_type == "box":
        if col_x in num_cols:
            s = df[col_x].dropna()
            result["data"] = [{
                "min": float(s.min()),
                "q25": float(s.quantile(0.25)),
                "median": float(s.median()),
                "q75": float(s.quantile(0.75)),
                "max": float(s.max())
            }]

    return result
