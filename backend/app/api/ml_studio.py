import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.schemas.schemas import TrainMLRequest
from app.core.database import get_dataset_by_id, get_models_by_dataset, get_model_by_id
from app.analysis.ml_engine import auto_train_models

router = APIRouter(tags=["ml_studio"])

@router.post("/train-ml")
async def train_ml_models(req: TrainMLRequest):
    meta = get_dataset_by_id(req.dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        results = auto_train_models(
            filepath=meta['filepath'],
            dataset_id=req.dataset_id,
            target_column=req.target_column,
            task_type=req.task_type,
            features=req.features,
            test_size=req.test_size,
            random_state=req.random_state
        )
        return {"status": "success", "data": results}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/models/{dataset_id}")
async def list_dataset_models(dataset_id: str):
    models = get_models_by_dataset(dataset_id)
    return {"status": "success", "data": models}

@router.get("/download-model/{model_id}")
async def download_trained_model(model_id: str):
    model_record = get_model_by_id(model_id)
    if not model_record:
        raise HTTPException(status_code=404, detail="Model record not found")
    
    filepath = model_record['filepath']
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Model binary file not found on disk")
        
    filename = f"{model_record['model_name'].replace(' ', '_')}_{model_id[:8]}.joblib"
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/octet-stream"
    )
