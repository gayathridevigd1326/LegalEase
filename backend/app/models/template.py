import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON

from backend.app.database import Base, GUID


class Template(Base):
    __tablename__ = "templates"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)  # Business, Employment, Real Estate, Freelance, Confidentiality, Personal, General
    jurisdiction = Column(String(100), nullable=True, default="General / Multi-jurisdiction")
    schema = Column(JSON, nullable=False)  # Dynamic field definitions: [{ name, label, type, required, placeholder, options }]
    prompt_template = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
