import json
from typing import Dict, Any, List
from backend.app.schemas.ai import GenerateDocumentRequest


class PromptBuilder:
    @staticmethod
    def get_system_instruction() -> str:
        return (
            "You are a world-class legal technology drafting assistant specialized in drafting clear, "
            "enforceable, and well-structured legal documents.\n\n"
            "STRICT RULES:\n"
            "1. Output MUST be valid JSON only. Do not wrap in markdown quotes or preface with conversational text.\n"
            "2. Never fabricate laws, court decisions, statutory citations, or regulatory authorities.\n"
            "3. If jurisdiction is provided, align phrasing with standard conventions of that jurisdiction without citing fabricated cases.\n"
            "4. If jurisdiction is 'Not specified' or omitted, draft neutral multi-jurisdictional terms with standard commercial practice.\n"
            "5. Preserve and incorporate all user-provided party names, roles, compensation, duration, and custom terms faithfully.\n"
            "6. Identify any missing standard terms (e.g. governing law, notice address, liability cap) in the 'missing_information' array.\n"
            "7. Clearly flag any legal caution or ambiguity in the 'warnings' array.\n"
            "8. Structure sections logically: Recitals/Background, Definitions (if applicable), Obligations/Scope, Financial Terms, "
            "Confidentiality/IP (if applicable), Term & Termination, Warranties & Indemnification, Dispute Resolution & Governing Law, Miscellaneous/General Provisions, and Signatures."
        )

    @staticmethod
    def build_generation_prompt(req: GenerateDocumentRequest) -> str:
        parties_data = [
            {
                "name": p.name,
                "role": p.role,
                "company": p.company or "N/A",
                "address": p.address or "N/A",
                "email": p.email or "N/A"
            }
            for p in req.parties
        ]

        payload = {
            "document_type": req.document_type,
            "title": req.title or f"{req.document_type.upper()}",
            "jurisdiction": req.jurisdiction or "Not specified",
            "parties": parties_data,
            "terms": req.terms,
            "additional_instructions": req.additional_instructions or "Draft a standard commercial document suitable for business use."
        }

        json_schema_spec = {
            "title": "Exact Title of Agreement",
            "document_type": req.document_type,
            "jurisdiction": req.jurisdiction or "Not specified",
            "parties": [
                {
                    "name": "Party Name",
                    "role": "Role (e.g. Disclosing Party, Landlord, Employer)",
                    "company": "Company Name",
                    "address": "Street Address",
                    "email": "Email"
                }
            ],
            "sections": [
                {
                    "id": "sec-1",
                    "heading": "1. PURPOSE AND SCOPE",
                    "content": "Full detailed legal clause paragraphs...",
                    "order": 1,
                    "clause_type": "scope"
                }
            ],
            "terms": {"key": "summary value"},
            "warnings": ["Caution regarding jurisdiction-specific severance rules, etc."],
            "missing_information": ["Items that would strengthen agreement if specified..."],
            "disclaimer": "LegalEase provides AI-generated legal information and document drafts for informational purposes only. It does not provide legal advice and does not replace review by a qualified legal professional."
        }

        return (
            f"Draft a comprehensive, professional {req.document_type} based on the following input parameters:\n\n"
            f"{json.dumps(payload, indent=2)}\n\n"
            f"Your output MUST conform strictly to this JSON structure:\n"
            f"{json.dumps(json_schema_spec, indent=2)}\n\n"
            f"Respond with raw JSON only."
        )

    @staticmethod
    def build_improve_prompt(text: str, instruction: str, context: str = None) -> str:
        return (
            f"You are an expert contract drafter. Revise the following legal clause according to this instruction: '{instruction}'.\n\n"
            f"Original Clause:\n\"\"\"{text}\"\"\"\n\n"
            + (f"Context / Document Type: {context}\n\n" if context else "")
            + "Return a valid JSON object with these keys:\n"
            "{\n"
            "  \"original_text\": \"...\",\n"
            "  \"proposed_text\": \"...\",\n"
            "  \"explanation\": \"Brief explanation of improvements and legal effect.\",\n"
            "  \"changes_made\": [\"List of specific changes\"]\n"
            "}\n"
            "Raw JSON only."
        )

    @staticmethod
    def build_explain_prompt(text: str, context: str = None) -> str:
        return (
            f"You are a legal educator. Explain the following legal clause in simple, plain English that a non-lawyer can easily understand:\n\n"
            f"Clause:\n\"\"\"{text}\"\"\"\n\n"
            + (f"Context: {context}\n\n" if context else "")
            + "Return a valid JSON object with these keys:\n"
            "{\n"
            "  \"clause_text\": \"...\",\n"
            "  \"plain_english_explanation\": \"Clear paragraph explaining what this means in practice.\",\n"
            "  \"key_implications\": [\"Important implication 1\", \"Important implication 2\"],\n"
            "  \"potential_risks\": [\"Potential risk to watch out for\"],\n"
            "  \"common_alternatives\": [\"Standard softer alternative or standard variation\"]\n"
            "}\n"
            "Raw JSON only."
        )

    @staticmethod
    def build_analysis_prompt(text: str) -> str:
        return (
            "You are a senior legal auditor. Analyze the following legal agreement thoroughly. "
            "Highlight key clauses, potential liability or operational risks, missing critical provisions, "
            "and suggest key questions the user should discuss with their qualified legal attorney.\n\n"
            "IMPORTANT: Do not label anything as legally invalid unless there is an unequivocal basis. Avoid fabricated citations.\n\n"
            f"Document Text:\n\"\"\"\n{text[:18000]}\n\"\"\"\n\n"
            "Return a valid JSON object with this exact structure:\n"
            "{\n"
            "  \"summary\": \"Executive plain-language summary of what this document does.\",\n"
            "  \"detected_document_type\": \"e.g. Non-Disclosure Agreement\",\n"
            "  \"detected_jurisdiction\": \"e.g. State of Delaware, USA, or Not specified\",\n"
            "  \"key_clauses\": [\n"
            "    {\n"
            "      \"clause_title\": \"Payment Terms\",\n"
            "      \"clause_type\": \"payment\",\n"
            "      \"excerpt\": \"Brief relevant quote\",\n"
            "      \"analysis\": \"Why this clause is significant\",\n"
            "      \"risk_level\": \"Low\" // Low, Medium, High, Critical\n"
            "    }\n"
            "  ],\n"
            "  \"risks\": [\n"
            "    {\n"
            "      \"title\": \"Uncapped Indemnification\",\n"
            "      \"description\": \"Detailed risk description\",\n"
            "      \"severity\": \"High\", // Low, Medium, High, Critical\n"
            "      \"recommendation\": \"How to negotiate or mitigate\"\n"
            "    }\n"
            "  ],\n"
            "  \"missing_information\": [\"List of clauses, notice addresses, or specifics that are absent\"],\n"
            "  \"questions_to_review\": [\"Key questions to ask qualified legal counsel\"]\n"
            "}\n"
            "Raw JSON only."
        )
