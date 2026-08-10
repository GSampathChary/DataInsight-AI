import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Dataset {
  id: string;
  filename: string;
  filepath: string;
  file_type: string;
  file_size: number;
  rows_count: number;
  cols_count: number;
  created_at: string;
}

export interface EDASummary {
  rows: number;
  columns: number;
  numeric_columns_count: number;
  categorical_columns_count: number;
  total_missing_values: number;
  missing_percentage: number;
  duplicate_rows: number;
  health_score: number;
}

export interface ColumnInfo {
  name: string;
  dtype: string;
  is_numeric: boolean;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  sample_values: any[];
}

export interface EDAData {
  summary: EDASummary;
  columns_info: ColumnInfo[];
  numeric_columns: string[];
  categorical_columns: string[];
  descriptive_stats: Record<string, {
    count: number;
    mean: number;
    std: number;
    min: number;
    q25: number;
    median: number;
    q75: number;
    max: number;
    skewness: number;
    kurtosis: number;
  }>;
  correlation_matrix: {
    columns: string[];
    values: number[][];
  };
  outliers_summary: Record<string, {
    count: number;
    percentage: number;
    lower_bound: number;
    upper_bound: number;
  }>;
}

export interface MLComparisonItem {
  model_name: string;
  score: number;
  metrics: Record<string, any>;
  feature_importances: Record<string, number>;
}

export interface MLTrainResult {
  best_model: {
    model_id: string;
    model_name: string;
    filepath: string;
    download_filename: string;
  };
  task_type: string;
  target_column: string;
  features_used: string[];
  all_models_comparison: MLComparisonItem[];
}
