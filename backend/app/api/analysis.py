from fastapi import APIRouter, HTTPException
from app.schemas.schemas import DataCleaningRequest, EDARequest
from app.core.database import get_dataset_by_id
from app.analysis.eda import perform_eda
from app.analysis.preprocessing import clean_dataset

router = APIRouter(tags=["analysis"])

@router.post("/eda")
async def get_eda(req: EDARequest):
    meta = get_dataset_by_id(req.dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        data = perform_eda(meta['filepath'])
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EDA processing failed: {str(e)}")

@router.post("/clean")
async def clean_data_endpoint(req: DataCleaningRequest):
    meta = get_dataset_by_id(req.dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        cleaned_path, stats = clean_dataset(
            filepath=meta['filepath'],
            missing_strategy=req.missing_strategy,
            fill_value=req.fill_value,
            remove_duplicates=req.remove_duplicates,
            columns_to_drop=req.columns_to_drop
        )
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data cleaning failed: {str(e)}")
