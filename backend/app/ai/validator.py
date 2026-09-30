import json
import re
from typing import Dict, Any, Optional

from backend.app.schemas.document import StructuredDocumentContent, DocumentSection, Party


class AIResponseValidator:
    """Cleans, parses, and validates responses from LLMs."""

    @staticmethod
    def extract_json_from_text(raw_text: str) -> Dict[str, Any]:
        """Extracts JSON object from text that may contain markdown fences or surrounding chatter."""
        if not raw_text or not raw_text.strip():
            raise ValueError("Empty response received from AI model.")

        text = raw_text.strip()

        # Remove markdown fences ```json ... ``` or ``` ... ```
        if "```" in text:
            # Pattern match code fence
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
            if match:
                text = match.group(1).strip()

        # If not matching or starts before/after
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            text = text[first_brace : last_brace + 1]

        # Parse JSON
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            # Try minor cleanups (e.g. trailing commas before } or ])
            cleaned = re.sub(r",\s*([\}\]])", r"\1", text)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                raise ValueError(f"Could not parse valid JSON from AI output: {exc.msg} (around line {exc.lineno})")

    @classmethod
    def validate_document_structure(cls, data: Dict[str, Any], fallback_title: str = "Legal Document") -> StructuredDocumentContent:
        """Validates and coerces parsed JSON dictionary into StructuredDocumentContent."""
        title = data.get("title") or fallback_title
        doc_type = data.get("document_type") or "Legal Agreement"
        jurisdiction = data.get("jurisdiction") or "Not specified"

        # Validate & format parties
        raw_parties = data.get("parties", [])
        parties: list[Party] = []
        for idx, p in enumerate(raw_parties):
            if isinstance(p, dict):
                parties.append(
                    Party(
                        name=str(p.get("name") or f"Party {idx + 1}"),
                        role=str(p.get("role") or f"Role {idx + 1}"),
                        company=p.get("company"),
                        address=p.get("address"),
                        email=p.get("email"),
                        custom_fields=p.get("custom_fields")
                    )
                )

        # Validate sections
        raw_sections = data.get("sections", [])
        sections: list[DocumentSection] = []
        for idx, s in enumerate(raw_sections):
            if isinstance(s, dict):
                heading = s.get("heading") or f"Section {idx + 1}"
                content = s.get("content") or ""
                sections.append(
                    DocumentSection(
                        id=s.get("id") or f"sec-{idx + 1}",
                        heading=heading,
                        content=content,
                        order=s.get("order", idx + 1),
                        clause_type=s.get("clause_type")
                    )
                )

        if not sections:
            # Fallback section if model returned raw text in another key
            sections.append(
                DocumentSection(
                    id="sec-1",
                    heading="1. TERMS AND CONDITIONS",
                    content=data.get("content") or data.get("text") or "Standard terms.",
                    order=1
                )
            )

        terms = data.get("terms") if isinstance(data.get("terms"), dict) else {}
        warnings = data.get("warnings") if isinstance(data.get("warnings"), list) else []
        missing_info = data.get("missing_information") if isinstance(data.get("missing_information"), list) else []
        disclaimer = data.get("disclaimer") or (
            "LegalEase provides AI-generated legal information and document drafts for informational purposes only. "
            "It does not provide legal advice and does not replace review by a qualified legal professional."
        )

        return StructuredDocumentContent(
            title=title,
            document_type=doc_type,
            jurisdiction=jurisdiction,
            parties=parties,
            sections=sections,
            terms=terms,
            warnings=warnings,
            missing_information=missing_info,
            disclaimer=disclaimer
        )
