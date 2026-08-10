import os
import uuid
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer

# Classification Models
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Regression Models
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

from app.services.dataset_service import load_dataframe
from app.config.config import MODELS_DIR
from app.core.database import save_trained_model

def auto_train_models(
    filepath: str,
    dataset_id: str,
    target_column: str,
    task_type: str = "auto",
    features: List[str] = None,
    test_size: float = 0.2,
    random_state: int = 42
) -> Dict[str, Any]:
    df = load_dataframe(filepath)
    
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")

    # Drop target nulls
    df = df.dropna(subset=[target_column])
    
    # Feature selection
    if not features:
        features = [c for c in df.columns if c != target_column]
    else:
        features = [c for c in features if c in df.columns and c != target_column]

    # Filter out obvious ID / key / unique string columns from features
    clean_features = []
    for col in features:
        col_lower = col.lower()
        if col_lower in ['id', 'index', 'uuid', 'key'] or col_lower.endswith('_id') or col_lower.endswith('id'):
            continue
        # Drop columns where every row is a unique string (like CustomerID/HouseID)
        if (df[col].dtype == 'object' or str(df[col].dtype) == 'category') and df[col].nunique() >= len(df) * 0.9:
            continue
        clean_features.append(col)

    if clean_features:
        features = clean_features

    if not features:
        raise ValueError("No valid feature columns available for model training")

    X = df[features].copy()
    y = df[target_column].copy()

    # Preprocess X features
    encoders = {}
    for col in X.columns:
        if X[col].dtype == 'object' or str(X[col].dtype) == 'category' or X[col].dtype == 'bool':
            X[col] = X[col].astype(str)
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col])
            encoders[col] = le
        else:
            imputer = SimpleImputer(strategy='median')
            X[[col]] = imputer.fit_transform(X[[col]])

    # Auto-detect task type if auto
    if task_type == "auto":
        is_numeric = np.issubdtype(y.dtype, np.number)
        n_unique = y.nunique()
        if not is_numeric or n_unique <= 10 or y.dtype == 'object' or y.dtype == 'bool':
            task_type = "classification"
        else:
            task_type = "regression"

    # Preprocess y target for both classification & regression
    target_encoder = None
    if y.dtype == 'object' or str(y.dtype) == 'category' or y.dtype == 'bool':
        target_encoder = LabelEncoder()
        y = target_encoder.fit_transform(y.astype(str))
    elif task_type == "classification":
        y = y.astype(int)

    # Adjust test split size for small datasets
    if len(df) < 10:
        actual_test_size = 0.2
    elif len(df) < 25:
        actual_test_size = 0.25
    else:
        actual_test_size = test_size

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=actual_test_size, random_state=random_state
    )

    # Scale numeric features for standard algorithms
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    results = []
    trained_model_objects = {}

    if task_type == "classification":
        candidate_models = {
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=random_state),
            "Gradient Boosting": GradientBoostingClassifier(random_state=random_state),
            "Decision Tree": DecisionTreeClassifier(random_state=random_state),
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=random_state)
        }
        
        for name, model in candidate_models.items():
            try:
                model.fit(X_train_scaled if name == "Logistic Regression" else X_train, y_train)
                preds = model.predict(X_test_scaled if name == "Logistic Regression" else X_test)
                
                acc = round(float(accuracy_score(y_test, preds)), 4)
                prec = round(float(precision_score(y_test, preds, average='weighted', zero_division=0)), 4)
                rec = round(float(recall_score(y_test, preds, average='weighted', zero_division=0)), 4)
                f1 = round(float(f1_score(y_test, preds, average='weighted', zero_division=0)), 4)
                cm = confusion_matrix(y_test, preds).tolist()

                # Feature importances
                importances = []
                if hasattr(model, 'feature_importances_'):
                    importances = [round(float(val), 4) for val in model.feature_importances_]
                elif hasattr(model, 'coef_'):
                    importances = [round(float(abs(val)), 4) for val in np.mean(model.coef_, axis=0) if len(model.coef_.shape) > 1] if len(model.coef_.shape) > 1 else [round(float(abs(val)), 4) for val in model.coef_]

                metrics = {
                    "accuracy": acc,
                    "precision": prec,
                    "recall": rec,
                    "f1_score": f1,
                    "confusion_matrix": cm
                }
                
                results.append({
                    "model_name": name,
                    "metrics": metrics,
                    "score": acc,
                    "feature_importances": dict(zip(features, importances)) if importances else {}
                })
                trained_model_objects[name] = model
            except Exception as e:
                continue

    else: # Regression
        candidate_models = {
            "Random Forest": RandomForestRegressor(n_estimators=100, random_state=random_state),
            "Gradient Boosting": GradientBoostingRegressor(random_state=random_state),
            "Decision Tree": DecisionTreeRegressor(random_state=random_state),
            "Linear Regression": LinearRegression(),
            "Ridge Regression": Ridge()
        }

        for name, model in candidate_models.items():
            try:
                model.fit(X_train_scaled if "Regression" in name and "Random" not in name and "Gradient" not in name and "Decision" not in name else X_train, y_train)
                preds = model.predict(X_test_scaled if "Regression" in name and "Random" not in name and "Gradient" not in name and "Decision" not in name else X_test)
                
                r2 = round(float(r2_score(y_test, preds)), 4)
                mae = round(float(mean_absolute_error(y_test, preds)), 4)
                mse = round(float(mean_squared_error(y_test, preds)), 4)
                rmse = round(float(np.sqrt(mse)), 4)

                importances = []
                if hasattr(model, 'feature_importances_'):
                    importances = [round(float(val), 4) for val in model.feature_importances_]
                elif hasattr(model, 'coef_'):
                    importances = [round(float(abs(val)), 4) for val in model.coef_]

                metrics = {
                    "r2_score": r2,
                    "mae": mae,
                    "mse": mse,
                    "rmse": rmse
                }

                results.append({
                    "model_name": name,
                    "metrics": metrics,
                    "score": r2,
                    "feature_importances": dict(zip(features, importances)) if importances else {}
                })
                trained_model_objects[name] = model
            except Exception as e:
                continue

    if not results:
        raise RuntimeError("Failed to train any models with the specified configuration")

    # Sort results by score (Accuracy for Classification, R2 for Regression)
    results = sorted(results, key=lambda x: x['score'], reverse=True)
    best_model_info = results[0]
    best_model_obj = trained_model_objects[best_model_info['model_name']]

    # Save best model to disk
    model_id = str(uuid.uuid4())
    saved_model_filename = f"{model_id}.joblib"
    saved_model_path = str(MODELS_DIR / saved_model_filename)

    model_package = {
        "model": best_model_obj,
        "scaler": scaler,
        "encoders": encoders,
        "target_encoder": target_encoder,
        "features": features,
        "target_column": target_column,
        "task_type": task_type,
        "model_name": best_model_info['model_name'],
        "metrics": best_model_info['metrics']
    }

    joblib.dump(model_package, saved_model_path)

    # Record in database
    save_trained_model(
        model_id=model_id,
        dataset_id=dataset_id,
        model_name=best_model_info['model_name'],
        task_type=task_type,
        target_column=target_column,
        metrics=best_model_info['metrics'],
        filepath=saved_model_path
    )

    return {
        "best_model": {
            "model_id": model_id,
            "model_name": best_model_info['model_name'],
            "filepath": saved_model_path,
            "download_filename": saved_model_filename
        },
        "task_type": task_type,
        "target_column": target_column,
        "features_used": features,
        "all_models_comparison": results
    }
