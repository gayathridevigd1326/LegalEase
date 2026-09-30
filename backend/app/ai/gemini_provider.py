import asyncio
import logging
from typing import Optional, Dict, Any
import google.generativeai as genai

from backend.app.config import settings
from backend.app.ai.provider_base import BaseAIProvider
from backend.app.ai.prompt_builder import PromptBuilder
from backend.app.ai.validator import AIResponseValidator
from backend.app.schemas.document import StructuredDocumentContent
from backend.app.schemas.ai import (
    GenerateDocumentRequest,
    ImproveClauseResponse,
    ExplainClauseResponse,
    SummarizeDocumentResponse,
    DocumentAnalysisResponse,
)

logger = logging.getLogger("legalease.gemini")


class GeminiProvider(BaseAIProvider):
    """
    Production Google Gemini API Provider for LegalEase.
    Configured via GEMINI_API_KEY and GEMINI_MODEL.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL or "gemini-2.5-flash"

        if not self.api_key:
            logger.warning("GeminiProvider initialized without API Key. Calls will fail unless MOCK_AI=true.")
        else:
            genai.configure(api_key=self.api_key)

    def _get_model(self, system_instruction: Optional[str] = None):
        kwargs = {"model_name": self.model_name}
        if system_instruction:
            kwargs["system_instruction"] = system_instruction
        return genai.GenerativeModel(**kwargs)

    async def _generate_with_retry(self, prompt: str, system_instruction: Optional[str] = None, retries: int = 2) -> str:
        """Executes Gemini query with async wrapper and retry logic."""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment or configuration.")

        model = self._get_model(system_instruction)
        last_err = None

        for attempt in range(retries + 1):
            try:
                # Wrap synchronous genai SDK call in thread pool for async compatibility
                response = await asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=8192,
                    )
                )
                if response and response.text:
                    return response.text
                else:
                    raise ValueError("Empty response received from Gemini model.")
            except Exception as e:
                last_err = e
                logger.warning(f"Gemini API attempt {attempt + 1} failed: {str(e)}")
                if attempt < retries:
                    await asyncio.sleep(1.0 * (attempt + 1))

        raise RuntimeError(f"Gemini API failed after {retries + 1} attempts: {str(last_err)}")

    async def generate_document(self, req: GenerateDocumentRequest) -> StructuredDocumentContent:
        prompt = PromptBuilder.build_generation_prompt(req)
        system_inst = PromptBuilder.get_system_instruction()

        raw_output = await self._generate_with_retry(prompt, system_instruction=system_inst)
        parsed = AIResponseValidator.extract_json_from_text(raw_output)
        validated = AIResponseValidator.validate_document_structure(parsed, fallback_title=req.title or req.document_type)
        return validated

    async def analyze_document(self, text: str) -> DocumentAnalysisResponse:
        prompt = PromptBuilder.build_analysis_prompt(text)
        system_inst = (
            "You are a professional legal auditor analyzing agreements. "
            "Output strictly valid JSON conforming to the requested schema."
        )

        raw_output = await self._generate_with_retry(prompt, system_instruction=system_inst)
        parsed = AIResponseValidator.extract_json_from_text(raw_output)

        return DocumentAnalysisResponse(
            summary=parsed.get("summary", "Document analyzed."),
            detected_document_type=parsed.get("detected_document_type"),
            detected_jurisdiction=parsed.get("detected_jurisdiction"),
            key_clauses=parsed.get("key_clauses", []),
            risks=parsed.get("risks", []),
            missing_information=parsed.get("missing_information", []),
            questions_to_review=parsed.get("questions_to_review", [])
        )

    async def improve_clause(self, text: str, instruction: str, context: Optional[str] = None) -> ImproveClauseResponse:
        prompt = PromptBuilder.build_improve_prompt(text, instruction, context)
        raw_output = await self._generate_with_retry(prompt)
        parsed = AIResponseValidator.extract_json_from_text(raw_output)
        return ImproveClauseResponse(
            original_text=text,
            proposed_text=parsed.get("proposed_text", text),
            explanation=parsed.get("explanation", "Clause updated per instruction."),
            changes_made=parsed.get("changes_made", [])
        )

    async def explain_clause(self, text: str, context: Optional[str] = None) -> ExplainClauseResponse:
        prompt = PromptBuilder.build_explain_prompt(text, context)
        raw_output = await self._generate_with_retry(prompt)
        parsed = AIResponseValidator.extract_json_from_text(raw_output)
        return ExplainClauseResponse(
            clause_text=text,
            plain_english_explanation=parsed.get("plain_english_explanation", "Explanation provided."),
            key_implications=parsed.get("key_implications", []),
            potential_risks=parsed.get("potential_risks", []),
            common_alternatives=parsed.get("common_alternatives", [])
        )

    async def summarize_document(self, text: str) -> SummarizeDocumentResponse:
        prompt = (
            "Summarize the following legal contract in plain English. Return valid JSON with keys: "
            "summary, key_points (list of strings), parties_involved (list of strings), governing_law, effective_duration.\n\n"
            f"Document:\n\"\"\"{text[:15000]}\"\"\"\n"
        )
        raw_output = await self._generate_with_retry(prompt)
        parsed = AIResponseValidator.extract_json_from_text(raw_output)
        return SummarizeDocumentResponse(
            summary=parsed.get("summary", "Document summarized."),
            key_points=parsed.get("key_points", []),
            parties_involved=parsed.get("parties_involved", []),
            governing_law=parsed.get("governing_law"),
            effective_duration=parsed.get("effective_duration")
        )
