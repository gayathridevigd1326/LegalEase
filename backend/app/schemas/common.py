from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[ErrorDetail] = None

    @classmethod
    def ok(cls, data: Optional[T] = None, message: str = "Success"):
        return cls(success=True, data=data, message=message, error=None)

    @classmethod
    def fail(cls, code: str, message: str, details: Optional[Any] = None):
        return cls(success=False, data=None, message=None, error=ErrorDetail(code=code, message=message, details=details))
