"""
LegalEase Gemini Document Generator Module.
Conforms directly to LegalEase.pdf Specification (Milestone 1, 2, and 3).
"""

import os
from typing import Optional, Union, List, Any
from dotenv import load_dotenv

load_dotenv()


class GeminiDocumentGenerator:
    """
    Core AI document generator integrating Google Generative AI (Gemini 1.5 Pro).
    Implements structured legal prompting and resilient fallback generation.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-pro"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = model_name
        self._client = None
        self._init_gemini()

    def _init_gemini(self):
        """Initialize Google Generative AI SDK if API key is present."""
        if self.api_key and not self.api_key.startswith("mock-") and len(self.api_key) > 10:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_name)
            except Exception as e:
                # Log and fallback gracefully
                self._client = None

    def _normalize_parties(self, parties: Union[str, List[Any]]) -> str:
        if isinstance(parties, list):
            items = []
            for p in parties:
                if isinstance(p, dict):
                    name = p.get("name", "Party")
                    role = p.get("role", "")
                    items.append(f"{name} ({role})" if role else name)
                else:
                    items.append(str(p))
            return "; ".join(items)
        return str(parties).strip()

    def _normalize_terms(self, terms: Union[str, List[str]]) -> List[str]:
        if isinstance(terms, list):
            return [t.strip() for t in terms if t.strip()]
        if isinstance(terms, str):
            # Split by semicolons as per PDF specification Page 19
            parts = [p.strip() for p in terms.split(";") if p.strip()]
            if not parts and terms.strip():
                parts = [terms.strip()]
            return parts
        return []

    def build_prompt(
        self,
        document_type: str,
        parties: str,
        terms: List[str],
        dates: Optional[str] = None,
        jurisdiction: Optional[str] = "General"
    ) -> str:
        """Constructs an expert legal prompt for Gemini 1.5 Pro."""
        terms_formatted = "\n".join([f"- {term}" for term in terms]) if terms else "- Standard terms and conditions apply"
        date_str = dates or "Upon signature"

        return f"""You are a senior legal counsel and expert contract drafting specialist.
Generate a comprehensive, legally valid, professional {document_type}.

REQUIREMENTS & PARAMETERS:
- Document Type: {document_type}
- Parties Involved: {parties}
- Key Terms & Conditions:
{terms_formatted}
- Effective Date: {date_str}
- Governing Jurisdiction: {jurisdiction or 'General / Applicable Law'}

STRUCTURE RULES:
1. Title: Bold, centered document title.
2. Preamble & Recitals: Clearly identify all parties, their legal capacities, addresses (if specified), and background context.
3. Core Provisions: Enumerate numbered articles or sections (e.g. 1. Purpose & Scope, 2. Consideration & Payment, 3. Term & Termination, 4. Confidentiality & Non-Disclosure, 5. Governing Law & Dispute Resolution).
4. Full incorporation of all requested terms: Ensure every user-specified term is drafted into an enforceable legal clause.
5. Standard protective boilerplate: Severability, Entire Agreement, Amendments in writing, Notices.
6. Execution Block: Professional signature lines for all specified parties with name, title, and date placeholders.

DRAFTING TONE:
Formal, precise, enforceable, professional legal prose without placeholders like '[Insert Date]'—use provided values.
"""

    def generate_document(
        self,
        document_type: str,
        parties: Union[str, List[Any]],
        terms: Union[str, List[str]],
        dates: Optional[str] = None,
        jurisdiction: Optional[str] = "General"
    ) -> str:
        """
        Generate complete legal document content.
        Uses Gemini 1.5 Pro when configured, otherwise uses deterministic fallback.
        """
        norm_parties = self._normalize_parties(parties)
        norm_terms = self._normalize_terms(terms)
        effective_date = dates or "Effective Date"

        # Attempt Gemini 1.5 Pro generation if configured
        if self._client:
            try:
                prompt = self.build_prompt(
                    document_type=document_type,
                    parties=norm_parties,
                    terms=norm_terms,
                    dates=effective_date,
                    jurisdiction=jurisdiction
                )
                response = self._client.generate_content(prompt)
                if response and hasattr(response, "text") and response.text.strip():
                    return response.text.strip()
            except Exception as e:
                # Log and fallback gracefully
                pass

        # Fallback Generator: High-fidelity legal document template
        return self._generate_fallback(document_type, norm_parties, norm_terms, effective_date, jurisdiction)

    def _generate_fallback(
        self,
        document_type: str,
        parties_str: str,
        terms_list: List[str],
        dates_str: str,
        jurisdiction: Optional[str]
    ) -> str:
        """Produces a pristine legal agreement matching PDF scenarios when offline."""
        title = document_type.upper()
        if not title.endswith("AGREEMENT") and not title.endswith("CONTRACT") and not title.endswith("LETTER"):
            title += " AGREEMENT"

        # Parse party labels respecting parentheses
        import re
        if ";" in parties_str:
            party_parts = [p.strip() for p in parties_str.split(";") if p.strip()]
        elif " and " in parties_str:
            party_parts = [p.strip() for p in parties_str.split(" and ") if p.strip()]
        else:
            # Split by comma that is NOT inside parentheses
            party_parts = [p.strip() for p in re.split(r",\s*(?![^()]*\))", parties_str) if p.strip()]

        if not party_parts:
            party_parts = [parties_str, "Counterparty"]
        elif len(party_parts) == 1:
            party_parts.append("Counterparty")

        parties_list_text = "\n".join([f"{i}. {p}" for i, p in enumerate(party_parts, 1)])

        clauses_text = ""
        for idx, term in enumerate(terms_list, 1):
            clauses_text += f"\nSECTION {idx}. SPECIAL COVENANT & TERMS\n{term}.\n"

        if not terms_list:
            clauses_text = """
SECTION 1. OBLIGATIONS AND DUTIES
The Parties agree to execute and perform their respective obligations with reasonable care, diligence, and professional skill in accordance with recognized industry standards.

SECTION 2. TERM AND TERMINATION
This Agreement shall commence on the Effective Date and remain in full force until terminated by either party upon thirty (30) days prior written notice.
"""

        sig_blocks = "\n\n".join([
            f"_____________________________________________\nFOR: {p}\nDate: {dates_str}"
            for p in party_parts
        ])

        return f"""{title}

THIS {document_type.upper()} ("Agreement") is made and entered into as of {dates_str} ("Effective Date"), by and between:

PARTIES:
{parties_list_text}

(Collectively referred to as the "Parties" and individually as a "Party").

RECITALS
WHEREAS, the Parties desire to establish a formal legal relationship concerning the subject matter set forth herein; and
WHEREAS, both Parties represent that they have full corporate and legal authority to enter into this Agreement and bind themselves to its covenants;

NOW, THEREFORE, in consideration of the mutual covenants, representations, and warranties contained herein, the Parties agree as follows:

{clauses_text.strip()}

SECTION 3. CONFIDENTIALITY AND NON-DISCLOSURE
Each Party agrees to hold in confidence all proprietary and confidential information disclosed by the other Party, and shall not disclose or reproduce such information to any third party without express prior written consent.

SECTION 4. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by, construed, and enforced in accordance with the substantive laws of {jurisdiction or 'the applicable jurisdiction'}, without regard to conflict of laws principles.

SECTION 5. ENTIRE AGREEMENT AND SEVERABILITY
This Agreement contains the sole and entire agreement between the Parties with respect to its subject matter. If any provision of this Agreement is held to be invalid or unenforceable, such holding shall not affect the validity of the remaining provisions.

IN WITNESS WHEREOF, the Parties hereto have caused this {document_type} to be duly executed and delivered as of the Effective Date.

{sig_blocks}
"""
