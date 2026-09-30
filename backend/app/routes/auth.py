from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    UserProfileUpdate,
)
from backend.app.services.auth_service import AuthService
from backend.app.security.auth_handler import get_current_user
from backend.app.security.rate_limit import rate_limit_auth

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[TokenResponse])
async def register(req: UserRegisterRequest, db: Session = Depends(get_db), _=Depends(rate_limit_auth)):
    user, token = AuthService.register_user(db, req)
    user_dto = UserResponse.model_validate(user)
    return APIResponse.ok(
        data=TokenResponse(access_token=token, token_type="bearer", user=user_dto),
        message="Account created successfully."
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(req: UserLoginRequest, db: Session = Depends(get_db), _=Depends(rate_limit_auth)):
    user, token = AuthService.login_user(db, req)
    user_dto = UserResponse.model_validate(user)
    return APIResponse.ok(
        data=TokenResponse(access_token=token, token_type="bearer", user=user_dto),
        message="Logged in successfully."
    )


@router.post("/logout", response_model=APIResponse[dict])
async def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT logout acknowledged by server
    return APIResponse.ok(data={"status": "logged_out"}, message="Successfully logged out.")


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    user_dto = UserResponse.model_validate(current_user)
    return APIResponse.ok(data=user_dto, message="User profile retrieved.")


@router.put("/profile", response_model=APIResponse[UserResponse])
async def update_profile(
    req: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = AuthService.update_profile(db, current_user, req)
    user_dto = UserResponse.model_validate(updated)
    return APIResponse.ok(data=user_dto, message="Profile updated successfully.")
