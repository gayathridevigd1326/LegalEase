import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    """Simple in-memory sliding-window rate limiter for sensitive routes."""
    def __init__(self, requests_per_minute: int = 60):
        self.rpm = requests_per_minute
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def check_rate_limit(self, client_id: str):
        now = time.time()
        window_start = now - 60.0
        # Clean older requests
        self.requests[client_id] = [t for t in self.requests[client_id] if t > window_start]
        if len(self.requests[client_id]) >= self.rpm:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again in a minute."
            )
        self.requests[client_id].append(now)


ai_rate_limiter = InMemoryRateLimiter(requests_per_minute=20)
auth_rate_limiter = InMemoryRateLimiter(requests_per_minute=30)


async def rate_limit_ai(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    ai_rate_limiter.check_rate_limit(client_ip)


async def rate_limit_auth(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    auth_rate_limiter.check_rate_limit(client_ip)
