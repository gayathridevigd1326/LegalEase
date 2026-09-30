from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.ai import (
    ImproveClauseRequest,
    ImproveClauseResponse,
    ExplainClauseRequest,
    ExplainClauseResponse,
    SummarizeDocumentRequest,
    SummarizeDocumentResponse,
    DocumentAnalysisResponse,
)
from backend.app.ai.document_generator import get_ai_provider
from backend.app.security.auth_handler import get_current_user
from backend.app.security.rate_limit import rate_limit_ai

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/improve", response_model=APIResponse[ImproveClauseResponse])
async def improve_clause(
    req: ImproveClauseRequest,
    current_user: User = Depends(get_current_user),
    _=Depends(rate_limit_ai)
):
    ai_provider = get_ai_provider()
    try:
        res = await ai_provider.improve_clause(req.text, req.instruction, req.context)
        return APIResponse.ok(data=res, message="Clause improved successfully.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve clause: {str(e)}"
        )


@router.post("/explain", response_model=APIResponse[ExplainClauseResponse])
async def explain_clause(
    req: ExplainClauseRequest,
    current_user: User = Depends(get_current_user),
    _=Depends(rate_limit_ai)
):
    ai_provider = get_ai_provider()
    try:
        res = await ai_provider.explain_clause(req.text, req.context)
        return APIResponse.ok(data=res, message="Explanation generated successfully.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to explain clause: {str(e)}"
        )


@router.post("/summarize", response_model=APIResponse[SummarizeDocumentResponse])
async def summarize(
    req: SummarizeDocumentRequest,
    current_user: User = Depends(get_current_user),
    _=Depends(rate_limit_ai)
):
    if not req.content or len(req.content.strip()) < 10:
        raise HTTPException(status_code=400, detail="Document content is too short to summarize.")

    ai_provider = get_ai_provider()
    try:
        res = await ai_provider.summarize_document(req.content)
        return APIResponse.ok(data=res, message="Summary generated successfully.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to summarize document: {str(e)}"
        )


@router.post("/analyze-text", response_model=APIResponse[DocumentAnalysisResponse])
async def analyze_text(
    payload: dict,
    current_user: User = Depends(get_current_user),
    _=Depends(rate_limit_ai)
):
    text = payload.get("text", "")
    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Provided text is too short for legal analysis.")

    ai_provider = get_ai_provider()
    try:
        analysis = await ai_provider.analyze_document(text)
        return APIResponse.ok(data=analysis, message="Document text analyzed successfully.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze text: {str(e)}"
        )
