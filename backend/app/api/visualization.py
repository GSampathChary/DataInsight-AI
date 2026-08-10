from fastapi import APIRouter, HTTPException, Query
from app.core.database import get_dataset_by_id
from app.analysis.eda import get_visualization_data

router = APIRouter(tags=["visualization"])

@router.get("/visualizations")
async def fetch_visualization(
    dataset_id: str,
    chart_type: str = Query("histogram"),
    col_x: str = Query(None),
    col_y: str = Query(None)
):
    meta = get_dataset_by_id(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        data = get_visualization_data(
            filepath=meta['filepath'],
            col_x=col_x,
            col_y=col_y,
            chart_type=chart_type
        )
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visualization failed: {str(e)}")
