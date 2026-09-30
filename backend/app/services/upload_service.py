import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.user import User
from backend.app.models.upload import UploadedDocument, AnalysisResult
from backend.app.document.extractor import extract_text_from_file, sanitize_filename, ALLOWED_EXTENSIONS
from backend.app.ai.document_generator import get_ai_provider
from backend.app.schemas.ai import DocumentAnalysisResponse, KeyClauseItem, RiskItem


class UploadService:
    @staticmethod
    async def process_upload_and_analyze(
        db: Session,
        user: User,
        file: UploadFile
    ) -> tuple[UploadedDocument, DocumentAnalysisResponse]:
        # Validate filename and extension
        filename = file.filename or "uploaded_document.txt"
        name, ext = os.path.splitext(filename)
        ext = ext.lower()

        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file extension '{ext}'. Allowed formats: PDF, DOCX, TXT."
            )

        clean_name = sanitize_filename(filename)
        unique_filename = f"{uuid.uuid4()}_{clean_name}"
        save_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        # Write file with size limit check
        max_bytes = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
        total_bytes = 0

        async with aiofiles.open(save_path, "wb") as out_file:
            while content := await file.read(1024 * 64):  # 64KB chunks
                total_bytes += len(content)
                if total_bytes > max_bytes:
                    # Clean up
                    await out_file.close()
                    if os.path.exists(save_path):
                        os.remove(save_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.UPLOAD_MAX_SIZE_MB}MB."
                    )
                await out_file.write(content)

        # Extract text
        try:
            extracted_text, _ = extract_text_from_file(save_path, ext)
        except Exception as e:
            if os.path.exists(save_path):
                os.remove(save_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to read and extract text from uploaded document: {str(e)}"
            )

        if not extracted_text or len(extracted_text.strip()) < 10:
            if os.path.exists(save_path):
                os.remove(save_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file appears to be empty or contains no extractable text."
            )

        # Save record in database
        uploaded_doc = UploadedDocument(
            id=uuid.uuid4(),
            user_id=user.id,
            filename=clean_name,
            file_type=ext.replace(".", ""),
            storage_reference=save_path,
            extracted_text=extracted_text[:50000]  # store up to 50k chars in db
        )
        db.add(uploaded_doc)
        db.flush()

        # Run AI analysis
        ai_provider = get_ai_provider()
        analysis: DocumentAnalysisResponse = await ai_provider.analyze_document(extracted_text)

        # Save analysis result in DB
        db_analysis = AnalysisResult(
            id=uuid.uuid4(),
            uploaded_document_id=uploaded_doc.id,
            summary=analysis.summary,
            key_clauses=[kc.model_dump() for kc in analysis.key_clauses],
            risks=[r.model_dump() for r in analysis.risks],
            missing_information=analysis.missing_information,
            questions_to_review=analysis.questions_to_review
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(uploaded_doc)

        return uploaded_doc, analysis
