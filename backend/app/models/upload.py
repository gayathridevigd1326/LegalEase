import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from backend.app.database import Base, GUID


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, docx, txt
    storage_reference = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="uploads")
    analysis_results = relationship("AnalysisResult", back_populates="uploaded_doc", cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    document_id = Column(GUID, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    uploaded_document_id = Column(GUID, ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=True, index=True)
    summary = Column(Text, nullable=False)
    key_clauses = Column(JSON, nullable=False, default=list)  # list of { title, type, content, importance }
    risks = Column(JSON, nullable=False, default=list)        # list of { title, description, severity, recommendation }
    missing_information = Column(JSON, nullable=False, default=list)  # list of strings / items
    questions_to_review = Column(JSON, nullable=False, default=list)  # list of questions for legal review
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    document = relationship("Document", back_populates="analysis_results")
    uploaded_doc = relationship("UploadedDocument", back_populates="analysis_results")
