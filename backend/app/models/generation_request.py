import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from backend.app.database import Base, GUID


class GenerationRequest(Base):
    __tablename__ = "generation_requests"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(GUID, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    document_type = Column(String(100), nullable=False)
    input_data = Column(JSON, nullable=False)
    model = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="COMPLETED")  # PENDING, PROCESSING, COMPLETED, FAILED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=True)

    # Relationships
    user = relationship("User", back_populates="generation_requests")
