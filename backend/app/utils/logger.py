import logging
import sys
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("legalease")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        start_time = time.time()

        # Log request start (without sensitive payload)
        client_host = request.client.host if request.client else "unknown"
        logger.info(f"REQ [{request_id}] {request.method} {request.url.path} from {client_host}")

        try:
            response: Response = await call_next(request)
            latency_ms = round((time.time() - start_time) * 1000, 2)
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{latency_ms}ms"

            logger.info(
                f"RES [{request_id}] {request.method} {request.url.path} "
                f"status={response.status_code} latency={latency_ms}ms"
            )
            return response
        except Exception as exc:
            latency_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"ERR [{request_id}] {request.method} {request.url.path} "
                f"failed with exception: {type(exc).__name__} latency={latency_ms}ms"
            )
            raise exc
