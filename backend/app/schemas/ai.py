import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from backend.app.schemas.document import Party, StructuredDocumentContent


class GenerateDocumentRequest(BaseModel):
    document_type: str
    template_id: Optional[uuid.UUID] = None
    title: Optional[str] = None
    jurisdiction: Optional[str] = "Not specified"
    parties: List[Party] = Field(default_factory=list)
    terms: Dict[str, Any] = Field(default_factory=dict)
    additional_instructions: Optional[str] = None
    save_as_document: Optional[bool] = True


class ImproveClauseRequest(BaseModel):
    text: str = Field(min_length=3)
    instruction: str = Field(description="Action like 'improve', 'simplify', 'formal', 'more_protective', 'neutral'")
    context: Optional[str] = None


class ImproveClauseResponse(BaseModel):
    original_text: str
    proposed_text: str
    explanation: str
    changes_made: Optional[List[str]] = None


class ExplainClauseRequest(BaseModel):
    text: str = Field(min_length=3)
    context: Optional[str] = None


class ExplainClauseResponse(BaseModel):
    clause_text: str
    plain_english_explanation: str
    key_implications: List[str]
    potential_risks: List[str]
    common_alternatives: Optional[List[str]] = None


class SummarizeDocumentRequest(BaseModel):
    content: Optional[str] = None
    document_id: Optional[uuid.UUID] = None


class SummarizeDocumentResponse(BaseModel):
    summary: str
    key_points: List[str]
    parties_involved: List[str]
    governing_law: Optional[str] = None
    effective_duration: Optional[str] = None


class KeyClauseItem(BaseModel):
    clause_title: str
    clause_type: str
    excerpt: str
    analysis: str
    risk_level: str = "Low"  # Low, Medium, High, Critical


class RiskItem(BaseModel):
    title: str
    description: str
    severity: str  # Low, Medium, High, Critical
    recommendation: str


class DocumentAnalysisResponse(BaseModel):
    summary: str
    key_clauses: List[KeyClauseItem] = Field(default_factory=list)
    risks: List[RiskItem] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    questions_to_review: List[str] = Field(default_factory=list)
    detected_document_type: Optional[str] = None
    detected_jurisdiction: Optional[str] = None
