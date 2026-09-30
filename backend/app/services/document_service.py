import uuid
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, status

from backend.app.models.document import Document, DocumentVersion, DocumentStatus
from backend.app.models.user import User
from backend.app.schemas.document import (
    DocumentCreateRequest,
    DocumentUpdateRequest,
    StructuredDocumentContent,
    DocumentResponse,
    DocumentVersionResponse,
    DocumentListItem,
)


class DocumentService:
    @staticmethod
    def create_document(
        db: Session,
        user: User,
        req: DocumentCreateRequest,
        initial_status: DocumentStatus = DocumentStatus.DRAFT
    ) -> Document:
        doc = Document(
            id=uuid.uuid4(),
            user_id=user.id,
            title=req.title,
            document_type=req.document_type,
            jurisdiction=req.jurisdiction or "Not specified",
            status=initial_status
        )
        db.add(doc)
        db.flush()

        # If content provided, save Version 1
        if req.content:
            version = DocumentVersion(
                id=uuid.uuid4(),
                document_id=doc.id,
                version_number=1,
                content=req.content.model_dump(),
                created_by=user.id
            )
            db.add(version)
            db.flush()
            doc.current_version_id = version.id

        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def get_document_by_id(db: Session, doc_id: uuid.UUID, user_id: uuid.UUID) -> Document:
        doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user_id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
        return doc

    @staticmethod
    def list_documents(
        db: Session,
        user_id: uuid.UUID,
        search: Optional[str] = None,
        doc_type: Optional[str] = None,
        doc_status: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        sort_by: str = "updated_at",
        sort_order: str = "desc",
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[Document], int]:
        query = db.query(Document).filter(Document.user_id == user_id)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Document.title.ilike(term),
                    Document.document_type.ilike(term),
                    Document.jurisdiction.ilike(term)
                )
            )

        if doc_type:
            query = query.filter(Document.document_type == doc_type)

        if doc_status:
            query = query.filter(Document.status == doc_status)

        if jurisdiction:
            query = query.filter(Document.jurisdiction.ilike(f"%{jurisdiction}%"))

        total = query.count()

        # Sorting
        sort_column = getattr(Document, sort_by, Document.updated_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        items = query.offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def update_document(
        db: Session,
        doc_id: uuid.UUID,
        user_id: uuid.UUID,
        req: DocumentUpdateRequest,
        create_new_version: bool = True
    ) -> Document:
        doc = DocumentService.get_document_by_id(db, doc_id, user_id)

        if req.title is not None:
            doc.title = req.title
        if req.jurisdiction is not None:
            doc.jurisdiction = req.jurisdiction
        if req.status is not None:
            doc.status = req.status
        else:
            doc.status = DocumentStatus.EDITED

        if req.content is not None:
            if create_new_version:
                # Determine next version number
                latest_version = db.query(DocumentVersion).filter(
                    DocumentVersion.document_id == doc.id
                ).order_by(DocumentVersion.version_number.desc()).first()
                next_version_num = (latest_version.version_number + 1) if latest_version else 1

                new_version = DocumentVersion(
                    id=uuid.uuid4(),
                    document_id=doc.id,
                    version_number=next_version_num,
                    content=req.content.model_dump(),
                    created_by=user_id
                )
                db.add(new_version)
                db.flush()
                doc.current_version_id = new_version.id
            else:
                # Update current version in-place (autosave micro-update)
                curr_ver = db.query(DocumentVersion).filter(
                    DocumentVersion.id == doc.current_version_id
                ).first()
                if curr_ver:
                    curr_ver.content = req.content.model_dump()
                else:
                    new_version = DocumentVersion(
                        id=uuid.uuid4(),
                        document_id=doc.id,
                        version_number=1,
                        content=req.content.model_dump(),
                        created_by=user_id
                    )
                    db.add(new_version)
                    db.flush()
                    doc.current_version_id = new_version.id

        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def get_document_versions(db: Session, doc_id: uuid.UUID, user_id: uuid.UUID) -> List[DocumentVersion]:
        DocumentService.get_document_by_id(db, doc_id, user_id)
        versions = db.query(DocumentVersion).filter(
            DocumentVersion.document_id == doc_id
        ).order_by(DocumentVersion.version_number.desc()).all()
        return versions

    @staticmethod
    def restore_version(
        db: Session,
        doc_id: uuid.UUID,
        version_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> Document:
        doc = DocumentService.get_document_by_id(db, doc_id, user_id)
        target_version = db.query(DocumentVersion).filter(
            DocumentVersion.id == version_id,
            DocumentVersion.document_id == doc.id
        ).first()

        if not target_version:
            raise HTTPException(status_code=404, detail="Specified version not found.")

        # Create a new version that restores the target content
        latest_version = db.query(DocumentVersion).filter(
            DocumentVersion.document_id == doc.id
        ).order_by(DocumentVersion.version_number.desc()).first()
        next_version_num = (latest_version.version_number + 1) if latest_version else 1

        restored_version = DocumentVersion(
            id=uuid.uuid4(),
            document_id=doc.id,
            version_number=next_version_num,
            content=target_version.content,
            created_by=user_id
        )
        db.add(restored_version)
        db.flush()

        doc.current_version_id = restored_version.id
        doc.status = DocumentStatus.EDITED
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def duplicate_document(db: Session, doc_id: uuid.UUID, user_id: uuid.UUID) -> Document:
        original = DocumentService.get_document_by_id(db, doc_id, user_id)
        current_version = db.query(DocumentVersion).filter(
            DocumentVersion.id == original.current_version_id
        ).first()

        new_doc = Document(
            id=uuid.uuid4(),
            user_id=user_id,
            title=f"Copy of {original.title}",
            document_type=original.document_type,
            jurisdiction=original.jurisdiction,
            status=DocumentStatus.DRAFT
        )
        db.add(new_doc)
        db.flush()

        if current_version:
            new_version = DocumentVersion(
                id=uuid.uuid4(),
                document_id=new_doc.id,
                version_number=1,
                content=current_version.content,
                created_by=user_id
            )
            db.add(new_version)
            db.flush()
            new_doc.current_version_id = new_version.id

        db.commit()
        db.refresh(new_doc)
        return new_doc

    @staticmethod
    def delete_document(db: Session, doc_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        doc = DocumentService.get_document_by_id(db, doc_id, user_id)
        db.delete(doc)
        db.commit()
        return True

    @staticmethod
    def to_response_dto(db: Session, doc: Document) -> DocumentResponse:
        current_content = None
        if doc.current_version_id:
            version = db.query(DocumentVersion).filter(DocumentVersion.id == doc.current_version_id).first()
            if version and version.content:
                try:
                    current_content = StructuredDocumentContent(**version.content)
                except Exception:
                    pass

        version_count = db.query(DocumentVersion).filter(DocumentVersion.document_id == doc.id).count()

        return DocumentResponse(
            id=doc.id,
            user_id=doc.user_id,
            title=doc.title,
            document_type=doc.document_type,
            jurisdiction=doc.jurisdiction,
            status=doc.status,
            current_version_id=doc.current_version_id,
            content=current_content,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
            version_count=version_count
        )
