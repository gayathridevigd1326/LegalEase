import uuid
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.user import User
from backend.app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserProfileUpdate
from backend.app.security.auth_handler import get_password_hash, verify_password, create_access_token


class AuthService:
    @staticmethod
    def register_user(db: Session, req: UserRegisterRequest) -> Tuple[User, str]:
        existing = db.query(User).filter(User.email == req.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        user = User(
            id=uuid.uuid4(),
            email=req.email.lower(),
            password_hash=get_password_hash(req.password),
            full_name=req.full_name.strip(),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return user, token

    @staticmethod
    def login_user(db: Session, req: UserLoginRequest) -> Tuple[User, str]:
        user = db.query(User).filter(User.email == req.email.lower()).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password."
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is currently deactivated."
            )

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return user, token

    @staticmethod
    def update_profile(db: Session, user: User, req: UserProfileUpdate) -> User:
        if req.email and req.email.lower() != user.email:
            existing = db.query(User).filter(User.email == req.email.lower(), User.id != user.id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email is already taken by another account.")
            user.email = req.email.lower()

        if req.full_name:
            user.full_name = req.full_name.strip()

        if req.new_password:
            if not req.current_password or not verify_password(req.current_password, user.password_hash):
                raise HTTPException(status_code=400, detail="Current password does not match.")
            user.password_hash = get_password_hash(req.new_password)

        db.commit()
        db.refresh(user)
        return user
