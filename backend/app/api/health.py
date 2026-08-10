from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "DataInsight AI Backend Engine",
        "version": "1.0.0"
    }
