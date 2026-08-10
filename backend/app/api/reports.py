from fastapi import APIRouter, HTTPException, Query
from app.core.database import get_dataset_by_id
from app.services.report_service import generate_markdown_report

router = APIRouter(tags=["reports"])

@router.get("/report")
async def get_report(dataset_id: str = Query(...)):
    meta = get_dataset_by_id(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        report = generate_markdown_report(meta['filepath'], dataset_id)
        return {"status": "success", "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
