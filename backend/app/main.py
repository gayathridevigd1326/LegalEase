from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.routes import api_router
from backend.app.services.template_service import TemplateService
from backend.app.utils.logger import StructuredLoggingMiddleware, logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed default templates
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized.")

    db = SessionLocal()
    try:
        TemplateService.seed_templates(db)
        logger.info("Templates verified and seeded successfully.")

        # Seed default demo user for instant login
        from backend.app.models.user import User
        from backend.app.security.auth_handler import get_password_hash
        import uuid

        demo_email = "demo@legalease.app"
        existing = db.query(User).filter(User.email == demo_email).first()
        if not existing:
            demo_user = User(
                id=uuid.uuid4(),
                email=demo_email,
                password_hash=get_password_hash("password123"),
                full_name="Alex Morgan",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            logger.info(f"Demo user created: {demo_email}")
        else:
            if not existing.is_active:
                existing.is_active = True
                db.commit()
            logger.info(f"Demo user verified: {demo_email}")
    except Exception as e:
        logger.error(f"Error seeding startup data: {e}")
    finally:
        db.close()

    yield

    # Shutdown
    logger.info("Shutting down LegalEase API.")


app = FastAPI(
    title="LegalEase — AI-Powered Legal Document Generator",
    description="Draft Smarter. Understand Better. Production-grade legal drafting and document intelligence platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
origins = settings.cors_origins_list
for default_origin in ["http://localhost:3000", "http://127.0.0.1:3000", "https://legal-ease-two-red.vercel.app"]:
    if default_origin not in origins and "*" not in origins:
        origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
app.add_middleware(StructuredLoggingMiddleware)


def _get_cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin")
    if origin:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        }
    return {}


# Normalized Error Handling
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        headers=_get_cors_headers(request),
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    msg = f"Validation error at '{first_error.get('loc', ['field'])[-1]}': {first_error.get('msg', 'Invalid input')}"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        headers=_get_cors_headers(request),
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": msg,
                "details": errors
            }
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers=_get_cors_headers(request),
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "We couldn't process your request right now. Please try again or contact support."
            }
        }
    )


# Mount main API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Include routes matching LegalEase.pdf specification (Milestones 2.2, 3.1, 3.2)
try:
    from routes import router as spec_router
    app.include_router(spec_router)
    app.include_router(spec_router, prefix=settings.API_V1_PREFIX)
except ImportError:
    pass


@app.get("/")
def root():
    return {
        "service": "LegalEase API",
        "tagline": "Draft Smarter. Understand Better.",
        "documentation": "/docs",
        "status": "online"
    }


@app.get("/health")
def health_root():
    return {
        "status": "healthy",
        "service": "LegalEase API",
        "tagline": "Draft Smarter. Understand Better.",
        "documentation": "/docs"
    }
