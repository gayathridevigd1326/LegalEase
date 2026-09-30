import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from backend.app.schemas.ai import DocumentAnalysisResponse


class UploadResponse(BaseModel):
    id: uuid.UUID
    filename: str
    file_type: str
    created_at: datetime
    extracted_text_preview: Optional[str] = None
    analysis: Optional[DocumentAnalysisResponse] = None

    class Config:
        from_attributes = True
