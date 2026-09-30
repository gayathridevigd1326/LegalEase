import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from backend.app.models.document import DocumentStatus


class Party(BaseModel):
    name: str
    role: str  # e.g., "Employer", "Employee", "Disclosing Party", "Receiving Party", "Landlord", "Tenant"
    company: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None


class DocumentSection(BaseModel):
    id: Optional[str] = None
    heading: str
    content: str
    order: Optional[int] = 0
    clause_type: Optional[str] = None  # e.g., "recital", "confidentiality", "termination", "payment"


class StructuredDocumentContent(BaseModel):
    title: str
    document_type: str
    jurisdiction: Optional[str] = "Not specified"
    parties: List[Party] = Field(default_factory=list)
    sections: List[DocumentSection] = Field(default_factory=list)
    terms: Optional[Dict[str, Any]] = Field(default_factory=dict)
    warnings: Optional[List[str]] = Field(default_factory=list)
    missing_information: Optional[List[str]] = Field(default_factory=list)
    disclaimer: Optional[str] = "LegalEase provides AI-generated legal information and document drafts for informational purposes only. It does not provide legal advice and does not replace review by a qualified legal professional. Laws and requirements vary by jurisdiction."
    raw_text: Optional[str] = None


class DocumentCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    document_type: str
    jurisdiction: Optional[str] = "Not specified"
    content: Optional[StructuredDocumentContent] = None


class DocumentUpdateRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[DocumentStatus] = None
    jurisdiction: Optional[str] = None
    content: Optional[StructuredDocumentContent] = None


class DocumentVersionResponse(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    version_number: int
    content: StructuredDocumentContent
    created_at: datetime
    created_by: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    document_type: str
    jurisdiction: Optional[str] = None
    status: DocumentStatus
    current_version_id: Optional[uuid.UUID] = None
    content: Optional[StructuredDocumentContent] = None
    created_at: datetime
    updated_at: datetime
    version_count: Optional[int] = 1

    class Config:
        from_attributes = True


class DocumentListItem(BaseModel):
    id: uuid.UUID
    title: str
    document_type: str
    jurisdiction: Optional[str] = None
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
