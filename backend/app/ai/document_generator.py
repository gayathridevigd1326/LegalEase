import logging
from backend.app.config import settings
from backend.app.ai.provider_base import BaseAIProvider
from backend.app.ai.gemini_provider import GeminiProvider
from backend.app.ai.mock_provider import MockAIProvider

logger = logging.getLogger("legalease.ai")

_ai_provider_instance: BaseAIProvider = None


def get_ai_provider() -> BaseAIProvider:
    """
    Factory function returning the configured AI Provider.
    If MOCK_AI=True or GEMINI_API_KEY is empty, returns MockAIProvider.
    Otherwise, returns GeminiProvider.
    """
    global _ai_provider_instance

    if _ai_provider_instance is not None:
        return _ai_provider_instance

    if settings.MOCK_AI or not settings.GEMINI_API_KEY:
        logger.info("Using MockAIProvider (MOCK_AI=true or GEMINI_API_KEY empty)")
        _ai_provider_instance = MockAIProvider()
    else:
        logger.info(f"Using GeminiProvider (Model: {settings.GEMINI_MODEL})")
        _ai_provider_instance = GeminiProvider(
            api_key=settings.GEMINI_API_KEY,
            model_name=settings.GEMINI_MODEL
        )

    return _ai_provider_instance


def reset_ai_provider():
    """Allows test fixtures to reconfigure the active provider."""
    global _ai_provider_instance
    _ai_provider_instance = None
