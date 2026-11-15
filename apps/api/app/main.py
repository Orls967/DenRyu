from __future__ import annotations

import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routes.analytics import router as analytics_router
from app.routes.health import router as health_router
from app.routes.plant import router as plant_router

app = FastAPI(
    title="DENRYU Engineering Analytics API",
    version="1.0.0",
    docs_url="/docs" if settings.denryu_env != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def _error_response(
    status_code: int,
    code: str,
    message: str,
    details: object,
    request_id: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": details,
                "requestId": request_id,
            }
        },
    )


@app.middleware("http")
async def attach_request_id(request: Request, call_next):
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    request_id = getattr(request.state, "request_id", "req_unknown")
    code = "INVALID_PARAMETER_BOUNDS" if exc.status_code == 400 else "HTTP_ERROR"
    return _error_response(exc.status_code, code, str(exc.detail), None, request_id)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", "req_unknown")
    return _error_response(
        422,
        "VALIDATION_ERROR",
        "Request payload validation failed.",
        exc.errors(),
        request_id,
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, _exc: Exception):
    request_id = getattr(request.state, "request_id", "req_unknown")
    return _error_response(
        500,
        "INTERNAL_ERROR",
        "Unexpected server error.",
        None,
        request_id,
    )


app.include_router(health_router, prefix="/api/v1")
app.include_router(plant_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
