import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.upload import UploadedDocument, AnalysisResult
from backend.app.schemas.common import APIResponse
from backend.app.schemas.upload import UploadResponse
from backend.app.schemas.ai import DocumentAnalysisResponse, KeyClauseItem, RiskItem
from backend.app.services.upload_service import UploadService
from backend.app.security.auth_handler import get_current_user
from backend.app.security.rate_limit import rate_limit_ai

router = APIRouter(prefix="/uploads", tags=["Uploads & Document Analysis"])


@router.post("", response_model=APIResponse[UploadResponse])
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _=Depends(rate_limit_ai)
):
    uploaded_doc, analysis = await UploadService.process_upload_and_analyze(db, current_user, file)

    response_data = UploadResponse(
        id=uploaded_doc.id,
        filename=uploaded_doc.filename,
        file_type=uploaded_doc.file_type,
        created_at=uploaded_doc.created_at,
        extracted_text_preview=uploaded_doc.extracted_text[:300] if uploaded_doc.extracted_text else "",
        analysis=analysis
    )

    return APIResponse.ok(
        data=response_data,
        message="Document uploaded and analyzed successfully."
    )


@router.get("", response_model=APIResponse[List[UploadResponse]])
async def list_uploads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(UploadedDocument).filter(
        UploadedDocument.user_id == current_user.id
    ).order_by(UploadedDocument.created_at.desc()).all()

    items = []
    for d in docs:
        latest_analysis = db.query(AnalysisResult).filter(
            AnalysisResult.uploaded_document_id == d.id
        ).order_by(AnalysisResult.created_at.desc()).first()

        analysis_dto = None
        if latest_analysis:
            key_clauses = [KeyClauseItem(**kc) for kc in latest_analysis.key_clauses] if latest_analysis.key_clauses else []
            risks = [RiskItem(**r) for r in latest_analysis.risks] if latest_analysis.risks else []
            analysis_dto = DocumentAnalysisResponse(
                summary=latest_analysis.summary,
                key_clauses=key_clauses,
                risks=risks,
                missing_information=latest_analysis.missing_information or [],
                questions_to_review=latest_analysis.questions_to_review or []
            )

        items.append(
            UploadResponse(
                id=d.id,
                filename=d.filename,
                file_type=d.file_type,
                created_at=d.created_at,
                extracted_text_preview=d.extracted_text[:200] if d.extracted_text else "",
                analysis=analysis_dto
            )
        )

    return APIResponse.ok(data=items, message=f"Retrieved {len(items)} uploaded documents.")


@router.get("/{upload_id}", response_model=APIResponse[UploadResponse])
async def get_upload(
    upload_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == upload_id,
        UploadedDocument.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Uploaded document not found.")

    latest_analysis = db.query(AnalysisResult).filter(
        AnalysisResult.uploaded_document_id == doc.id
    ).order_by(AnalysisResult.created_at.desc()).first()

    analysis_dto = None
    if latest_analysis:
        key_clauses = [KeyClauseItem(**kc) for kc in latest_analysis.key_clauses] if latest_analysis.key_clauses else []
        risks = [RiskItem(**r) for r in latest_analysis.risks] if latest_analysis.risks else []
        analysis_dto = DocumentAnalysisResponse(
            summary=latest_analysis.summary,
            key_clauses=key_clauses,
            risks=risks,
            missing_information=latest_analysis.missing_information or [],
            questions_to_review=latest_analysis.questions_to_review or []
        )

    return APIResponse.ok(
        data=UploadResponse(
            id=doc.id,
            filename=doc.filename,
            file_type=doc.file_type,
            created_at=doc.created_at,
            extracted_text_preview=doc.extracted_text[:1000] if doc.extracted_text else "",
            analysis=analysis_dto
        ),
        message="Uploaded document retrieved."
    )
