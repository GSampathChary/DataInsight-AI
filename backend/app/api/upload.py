from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.services.dataset_service import save_uploaded_file, get_dataset_preview
from app.core.database import get_all_datasets, get_dataset_by_id

router = APIRouter(tags=["upload"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["csv", "xlsx", "xls"]:
        raise HTTPException(status_code=400, detail="Only CSV and Excel (.xlsx, .xls) files are supported")

    content = await file.read()
    try:
        result = save_uploaded_file(content, file.filename)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")

@router.get("/datasets")
async def list_datasets():
    datasets = get_all_datasets()
    return {"status": "success", "data": datasets}

@router.get("/datasets/{dataset_id}")
async def get_dataset_details(dataset_id: str):
    meta = get_dataset_by_id(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"status": "success", "data": meta}

@router.get("/dataset-preview/{dataset_id}")
async def preview_dataset(dataset_id: str, limit: int = Query(10, ge=1, le=100)):
    try:
        data = get_dataset_preview(dataset_id, limit=limit)
        return {"status": "success", "data": data}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch preview: {str(e)}")
