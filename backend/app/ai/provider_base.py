from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

from backend.app.schemas.document import StructuredDocumentContent
from backend.app.schemas.ai import (
    GenerateDocumentRequest,
    ImproveClauseResponse,
    ExplainClauseResponse,
    SummarizeDocumentResponse,
    DocumentAnalysisResponse,
)


class BaseAIProvider(ABC):
    """Abstract base class for all AI providers in LegalEase."""

    @abstractmethod
    async def generate_document(self, req: GenerateDocumentRequest) -> StructuredDocumentContent:
        """Generates a fully structured legal document draft."""
        pass

    @abstractmethod
    async def analyze_document(self, text: str) -> DocumentAnalysisResponse:
        """Analyzes an uploaded or existing legal document."""
        pass

    @abstractmethod
    async def improve_clause(self, text: str, instruction: str, context: Optional[str] = None) -> ImproveClauseResponse:
        """Rewrites or optimizes a selected clause according to instruction."""
        pass

    @abstractmethod
    async def explain_clause(self, text: str, context: Optional[str] = None) -> ExplainClauseResponse:
        """Explains a legal clause in plain English, noting implications and risks."""
        pass

    @abstractmethod
    async def summarize_document(self, text: str) -> SummarizeDocumentResponse:
        """Provides an executive summary of key terms and provisions."""
        pass
