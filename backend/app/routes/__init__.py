from fastapi import APIRouter
from backend.app.routes.auth import router as auth_router
from backend.app.routes.documents import router as documents_router
from backend.app.routes.templates import router as templates_router
from backend.app.routes.uploads import router as uploads_router
from backend.app.routes.ai import router as ai_router
from backend.app.routes.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(documents_router)
api_router.include_router(templates_router)
api_router.include_router(uploads_router)
api_router.include_router(ai_router)

__all__ = ["api_router"]
