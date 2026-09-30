import os
import re
from typing import Tuple
import pypdf
import docx

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def sanitize_filename(filename: str) -> str:
    """Strip dangerous characters and keep filename clean."""
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    return clean[:200]


def extract_text_from_file(file_path: str, file_ext: str) -> Tuple[str, int]:
    """
    Extracts plain text from PDF, DOCX, or TXT.
    Returns (extracted_text, page_or_paragraph_count).
    """
    ext = file_ext.lower()
    if not ext.startswith("."):
        ext = f".{ext}"

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
            lines = content.splitlines()
            return content.strip(), len(lines)

    elif ext == ".pdf":
        reader = pypdf.PdfReader(file_path)
        extracted = []
        page_count = len(reader.pages)
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                extracted.append(f"--- Page {i + 1} ---\n{text.strip()}")
        full_text = "\n\n".join(extracted).strip()
        return full_text, page_count

    elif ext == ".docx":
        doc = docx.Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs).strip()
        return full_text, len(paragraphs)

    else:
        raise ValueError(f"Unsupported file format: {ext}. Allowed: PDF, DOCX, TXT")
