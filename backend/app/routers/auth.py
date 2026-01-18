from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import RefreshToken, User
from ..schemas import LoginRequest, RefreshRequest, TokenPair, UserCreate, UserOut
from ..security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
    get_current_user,
)

router = APIRouter(tags=["auth"])


def validate_timezone(tz: str) -> str:
    try:
        ZoneInfo(tz)
    except ZoneInfoNotFoundError as exc:
        raise HTTPException(status_code=400, detail="Invalid timezone") from exc
    return tz


@router.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.phone == payload.phone))
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")

    timezone = validate_timezone(payload.timezone)
    user = User(
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        timezone=timezone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.phone == payload.phone))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token, access_expires_in = create_access_token(user.id)
    refresh_token, refresh_expires_in, refresh_expires_at = create_refresh_token(user.id)

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
        )
    )
    db.commit()

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=access_expires_in,
        refresh_expires_in=refresh_expires_in,
    )


@router.post("/auth/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    token_hash = hash_token(payload.refresh_token)
    stored = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
        )
    )
    if not stored:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    if stored.expires_at < datetime.utcnow():
        stored.revoked_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    stored.revoked_at = datetime.utcnow()

    access_token, access_expires_in = create_access_token(stored.user_id)
    refresh_token, refresh_expires_in, refresh_expires_at = create_refresh_token(stored.user_id)
    db.add(
        RefreshToken(
            user_id=stored.user_id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expires_at,
        )
    )
    db.commit()

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=access_expires_in,
        refresh_expires_in=refresh_expires_in,
    )


@router.post("/auth/logout")
def logout(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.refresh_token)
    stored = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
        )
    )
    if stored:
        stored.revoked_at = datetime.utcnow()
        db.commit()
    return {"status": "ok"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
