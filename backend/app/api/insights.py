from fastapi import APIRouter, HTTPException
from app.schemas.schemas import AIInsightsRequest
from app.core.database import get_dataset_by_id
from app.services.gemini_service import generate_ai_insights

router = APIRouter(tags=["insights"])

@router.post("/ai-insights")
async def get_ai_insights(req: AIInsightsRequest):
    meta = get_dataset_by_id(req.dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        data = generate_ai_insights(
            filepath=meta['filepath'],
            prompt_type=req.prompt_type,
            custom_question=req.custom_question,
            api_key=req.api_key
        )
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI insights: {str(e)}")
