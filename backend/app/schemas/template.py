import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class TemplateField(BaseModel):
    name: str
    label: str
    type: str  # text, textarea, number, currency, date, select, checkbox
    required: bool = False
    placeholder: Optional[str] = None
    default_value: Optional[Any] = None
    options: Optional[List[str]] = None  # for select type
    help_text: Optional[str] = None
    step: Optional[int] = 4  # wizard step


class TemplateSchema(BaseModel):
    fields: List[TemplateField]


class TemplateCreateRequest(BaseModel):
    name: str
    description: str
    category: str
    jurisdiction: Optional[str] = "General / Multi-jurisdiction"
    schema_data: Dict[str, Any] = Field(..., alias="schema")
    prompt_template: str

    model_config = ConfigDict(populate_by_name=True)


class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    category: str
    jurisdiction: Optional[str] = None
    schema_def: Dict[str, Any] = Field(..., alias="schema")
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
