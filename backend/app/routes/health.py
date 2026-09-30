from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.schemas.common import APIResponse
from backend.app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=APIResponse[dict])
async def health_check():
    return APIResponse.ok(
        data={
            "status": "healthy",
            "service": "LegalEase API",
            "environment": settings.ENVIRONMENT,
            "mock_ai": settings.MOCK_AI,
            "model": settings.GEMINI_MODEL if not settings.MOCK_AI else "mock-provider",
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        message="Service is operating normally."
    )
