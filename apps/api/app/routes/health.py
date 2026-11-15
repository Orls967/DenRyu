from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def get_health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "denryu-analytics-api",
        "version": "1.0.0",
        "modelOrigin": "synthetic_educational",
    }
