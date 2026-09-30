"""
LegalEase API Routes Module.
Conforms strictly to LegalEase.pdf Specification (Milestone 2.2, 3.1, 3.2).
Exposes DocumentRequest and POST /generate endpoint using GeminiDocumentGenerator.
"""

from typing import Optional, Union, List, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Response

from ai_core.gemini_generator import GeminiDocumentGenerator
from backend.app.document.formatting import (
    sanitize_text,
    format_html_preview,
    format_docx,
    format_pdf,
)

router = APIRouter(tags=["LegalEase Generation"])

generator = GeminiDocumentGenerator()


class DocumentRequest(BaseModel):
    """
    Pydantic request model matching LegalEase.pdf Page 2, 3, 6, 12, 18, 19.
    Accepts:
    - document_type: e.g. 'Employment Contract', 'NDA', 'Lease Agreement'
    - parties: string (e.g. 'Jane Doe (Service Provider), TechNova Inc. (Client)') or list
    - terms: semicolon-separated clauses (e.g. 'Payment within 30 days; 15 days notice') or list
    - dates: effective date (e.g. 'April 10, 2025' or '10/04/2025')
    """
    document_type: str = Field(..., description="Type of legal document")
    parties: Union[str, List[Any]] = Field(..., description="Involved parties/stakeholders")
    terms: Union[str, List[str]] = Field(..., description="Semicolon-separated clauses or list of terms")
    dates: Optional[str] = Field(None, description="Effective date of agreement")
    effective_date: Optional[str] = Field(None, description="Alternative alias for dates")
    jurisdiction: Optional[str] = Field("General", description="Governing jurisdiction")


class ExportRequest(BaseModel):
    text: str
    document_type: str = "Legal Document"
    terms: Optional[str] = None


@router.post("/generate")
def generate_document(req: DocumentRequest):
    """
    POST /generate endpoint matching PDF Milestone 2.2 & 3.2.
    Routes input to GeminiDocumentGenerator and returns structured legal content.
    """
    try:
        effective_date = req.dates or req.effective_date or "Effective Date"
        generated_raw = generator.generate_document(
            document_type=req.document_type,
            parties=req.parties,
            terms=req.terms,
            dates=effective_date,
            jurisdiction=req.jurisdiction or "General"
        )

        clean_text = sanitize_text(generated_raw)
        preview_html = format_html_preview(clean_text)

        return {
            "success": True,
            "document_type": req.document_type,
            "parties": req.parties,
            "terms": req.terms,
            "dates": effective_date,
            "jurisdiction": req.jurisdiction,
            "generated_text": clean_text,
            "content": clean_text,
            "preview_html": preview_html,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate document: {str(e)}"
        )


@router.post("/format/docx")
def export_docx_endpoint(req: ExportRequest):
    """Export formatted DOCX with embedded logo, Times New Roman, and terms table."""
    try:
        docx_bytes = format_docx(
            text=req.text,
            doc_type=req.document_type,
            terms=req.terms
        )
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{req.document_type.lower().replace(" ", "_")}.docx"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/format/pdf")
def export_pdf_endpoint(req: ExportRequest):
    """Export branded PDF with logo and footer on all pages."""
    try:
        pdf_bytes = format_pdf(
            text=req.text,
            doc_type=req.document_type,
            terms=req.terms
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{req.document_type.lower().replace(" ", "_")}.pdf"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
