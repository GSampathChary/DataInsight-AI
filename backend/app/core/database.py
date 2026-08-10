import sqlite3
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.config.config import DB_PATH

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Datasets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS datasets (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            rows_count INTEGER,
            cols_count INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Models table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trained_models (
            id TEXT PRIMARY KEY,
            dataset_id TEXT NOT NULL,
            model_name TEXT NOT NULL,
            task_type TEXT NOT NULL,
            target_column TEXT NOT NULL,
            metrics TEXT NOT NULL,
            filepath TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dataset_id) REFERENCES datasets (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def save_dataset_meta(dataset_id: str, filename: str, filepath: str, file_type: str, file_size: int, rows_count: int, cols_count: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO datasets (id, filename, filepath, file_type, file_size, rows_count, cols_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (dataset_id, filename, filepath, file_type, file_size, rows_count, cols_count, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_all_datasets() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM datasets ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_dataset_by_id(dataset_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM datasets WHERE id = ?', (dataset_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def save_trained_model(model_id: str, dataset_id: str, model_name: str, task_type: str, target_column: str, metrics: Dict[str, Any], filepath: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO trained_models (id, dataset_id, model_name, task_type, target_column, metrics, filepath, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (model_id, dataset_id, model_name, task_type, target_column, json.dumps(metrics), filepath, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_models_by_dataset(dataset_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM trained_models WHERE dataset_id = ? ORDER BY created_at DESC', (dataset_id,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        item = dict(r)
        item['metrics'] = json.loads(item['metrics'])
        results.append(item)
    return results

def get_model_by_id(model_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM trained_models WHERE id = ?', (model_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        item = dict(row)
        item['metrics'] = json.loads(item['metrics'])
        return item
    return None
