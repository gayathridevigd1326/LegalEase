import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.common import APIResponse
from backend.app.schemas.template import TemplateResponse
from backend.app.services.template_service import TemplateService

router = APIRouter(prefix="/templates", tags=["Templates"])


@router.get("", response_model=APIResponse[List[TemplateResponse]])
async def list_templates(
    category: Optional[str] = Query(None, description="Category filter (Business, Employment, Real Estate, etc.)"),
    search: Optional[str] = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    templates = TemplateService.list_templates(db, category=category, search=search)
    dtos = [TemplateResponse.model_validate(t) for t in templates]
    return APIResponse.ok(data=dtos, message=f"Retrieved {len(dtos)} templates.")


@router.get("/{template_id}", response_model=APIResponse[TemplateResponse])
async def get_template(
    template_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    template = TemplateService.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found.")
    return APIResponse.ok(data=TemplateResponse.model_validate(template), message="Template retrieved.")
