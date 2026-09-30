import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.document import DocumentStatus, DocumentVersion
from backend.app.models.generation_request import GenerationRequest
from backend.app.schemas.common import APIResponse
from backend.app.schemas.document import (
    DocumentCreateRequest,
    DocumentUpdateRequest,
    DocumentResponse,
    DocumentListItem,
    DocumentVersionResponse,
    StructuredDocumentContent,
)
from backend.app.schemas.ai import GenerateDocumentRequest
from backend.app.services.document_service import DocumentService
from backend.app.security.auth_handler import get_current_user
from backend.app.security.rate_limit import rate_limit_ai
from backend.app.ai.document_generator import get_ai_provider
from backend.app.document.document_exporter import DocumentExporter
from backend.app.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("", response_model=APIResponse[DocumentResponse])
async def create_document(
    req: DocumentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = DocumentService.create_document(db, current_user, req)
    dto = DocumentService.to_response_dto(db, doc)
    return APIResponse.ok(data=dto, message="Document created successfully.")


@router.get("", response_model=APIResponse[dict])
async def list_documents(
    search: Optional[str] = Query(None, description="Search term for title or type"),
    doc_type: Optional[str] = Query(None, description="Filter by document type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    jurisdiction: Optional[str] = Query(None, description="Filter by jurisdiction"),
    sort_by: str = Query("updated_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skip = (page - 1) * page_size
    items, total = DocumentService.list_documents(
        db=db,
        user_id=current_user.id,
        search=search,
        doc_type=doc_type,
        doc_status=status,
        jurisdiction=jurisdiction,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=page_size
    )

    item_dtos = [DocumentListItem.model_validate(item) for item in items]
    return APIResponse.ok(
        data={
            "items": item_dtos,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size if total > 0 else 1
        },
        message="Documents retrieved successfully."
    )


@router.post("/generate", response_model=APIResponse[DocumentResponse])
async def generate_document(
    req: GenerateDocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _=Depends(rate_limit_ai)
):
    ai_provider = get_ai_provider()
    model_name = getattr(ai_provider, "model_name", "mock-legal-v1")

    # Log generation request
    gen_req = GenerationRequest(
        id=uuid.uuid4(),
        user_id=current_user.id,
        document_type=req.document_type,
        input_data=req.model_dump(mode="json"),
        model=str(model_name),
        status="PROCESSING"
    )
    db.add(gen_req)
    db.commit()

    try:
        structured_content: StructuredDocumentContent = await ai_provider.generate_document(req)
    except Exception as e:
        gen_req.status = "FAILED"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document generation failed: {str(e)}"
        )

    # Save as Document
    create_req = DocumentCreateRequest(
        title=structured_content.title or f"{req.document_type} - {req.jurisdiction or 'Standard'}",
        document_type=req.document_type,
        jurisdiction=req.jurisdiction or "Not specified",
        content=structured_content
    )
    doc = DocumentService.create_document(db, current_user, create_req, initial_status=DocumentStatus.GENERATED)

    gen_req.document_id = doc.id
    gen_req.status = "COMPLETED"
    db.commit()

    dto = DocumentService.to_response_dto(db, doc)
    return APIResponse.ok(data=dto, message="Document generated successfully.")


@router.get("/{doc_id}", response_model=APIResponse[DocumentResponse])
async def get_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = DocumentService.get_document_by_id(db, doc_id, current_user.id)
    dto = DocumentService.to_response_dto(db, doc)
    return APIResponse.ok(data=dto, message="Document retrieved.")


@router.put("/{doc_id}", response_model=APIResponse[DocumentResponse])
async def update_document(
    doc_id: uuid.UUID,
    req: DocumentUpdateRequest,
    new_version: bool = Query(True, description="Whether to create a new version (set false for minor autosaves)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = DocumentService.update_document(db, doc_id, current_user.id, req, create_new_version=new_version)
    dto = DocumentService.to_response_dto(db, doc)
    return APIResponse.ok(data=dto, message="Document updated successfully.")


@router.post("/{doc_id}/duplicate", response_model=APIResponse[DocumentResponse])
async def duplicate_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_doc = DocumentService.duplicate_document(db, doc_id, current_user.id)
    dto = DocumentService.to_response_dto(db, new_doc)
    return APIResponse.ok(data=dto, message="Document duplicated successfully.")


@router.delete("/{doc_id}", response_model=APIResponse[dict])
async def delete_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    DocumentService.delete_document(db, doc_id, current_user.id)
    return APIResponse.ok(data={"id": str(doc_id)}, message="Document deleted successfully.")


@router.get("/{doc_id}/versions", response_model=APIResponse[List[DocumentVersionResponse]])
async def get_document_versions(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    versions = DocumentService.get_document_versions(db, doc_id, current_user.id)
    version_dtos = []
    for v in versions:
        content_obj = StructuredDocumentContent(**v.content) if isinstance(v.content, dict) else None
        version_dtos.append(
            DocumentVersionResponse(
                id=v.id,
                document_id=v.document_id,
                version_number=v.version_number,
                content=content_obj,
                created_at=v.created_at,
                created_by=v.created_by
            )
        )
    return APIResponse.ok(data=version_dtos, message="Document versions retrieved.")


@router.post("/{doc_id}/versions/{version_id}/restore", response_model=APIResponse[DocumentResponse])
async def restore_version(
    doc_id: uuid.UUID,
    version_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = DocumentService.restore_version(db, doc_id, version_id, current_user.id)
    dto = DocumentService.to_response_dto(db, doc)
    return APIResponse.ok(data=dto, message="Version restored successfully.")


@router.get("/{doc_id}/export/{format}")
async def export_document(
    doc_id: uuid.UUID,
    format: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = DocumentService.get_document_by_id(db, doc_id, current_user.id)
    if not doc.current_version_id:
        raise HTTPException(status_code=400, detail="Document has no content to export.")

    version = db.query(DocumentVersion).filter(DocumentVersion.id == doc.current_version_id).first()
    if not version or not version.content:
        raise HTTPException(status_code=400, detail="Document content is empty.")

    doc_content = StructuredDocumentContent(**version.content)
    clean_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in doc.title)[:50].strip() or "document"

    fmt = format.lower()
    if fmt == "txt":
        bytes_data = DocumentExporter.export_txt(doc_content)
        return Response(
            content=bytes_data,
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}.txt"'}
        )
    elif fmt == "docx":
        bytes_data = DocumentExporter.export_docx(doc_content)
        return Response(
            content=bytes_data,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}.docx"'}
        )
    elif fmt == "pdf":
        bytes_data = DocumentExporter.export_pdf(doc_content)
        return Response(
            content=bytes_data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}.pdf"'}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid export format. Allowed formats: pdf, docx, txt.")
