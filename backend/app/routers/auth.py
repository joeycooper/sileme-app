from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import RefreshToken, User
from ..schemas import DeviceOut, LoginRequest, RefreshRequest, SmsRequest, TokenPair, UserCreate, UserOut
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

MOCK_SMS_CODE = "123456"


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
    if payload.sms_code != MOCK_SMS_CODE:
        raise HTTPException(status_code=400, detail="Invalid SMS code")

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
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.phone == payload.phone))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token, access_expires_in = create_access_token(user.id)
    refresh_token, refresh_expires_in, refresh_expires_at = create_refresh_token(user.id)

    token_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        expires_at=refresh_expires_at,
        device_name=payload.device_name,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(token_record)
    db.commit()
    db.refresh(token_record)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=access_expires_in,
        refresh_expires_in=refresh_expires_in,
        refresh_token_id=token_record.id,
    )


@router.post("/auth/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, request: Request, db: Session = Depends(get_db)):
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
    token_record = RefreshToken(
        user_id=stored.user_id,
        token_hash=hash_token(refresh_token),
        expires_at=refresh_expires_at,
        device_name=stored.device_name,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else stored.ip_address,
    )
    db.add(token_record)
    db.commit()
    db.refresh(token_record)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=access_expires_in,
        refresh_expires_in=refresh_expires_in,
        refresh_token_id=token_record.id,
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


@router.post("/auth/request-code")
def request_code(payload: SmsRequest):
    return {"status": "ok", "message": "Mock code sent", "code": MOCK_SMS_CODE}


@router.get("/auth/devices", response_model=list[DeviceOut])
def list_devices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = (
        select(RefreshToken)
        .where(RefreshToken.user_id == current_user.id)
        .order_by(desc(RefreshToken.created_at))
    )
    tokens = list(db.scalars(stmt).all())
    deduped: list[RefreshToken] = []
    seen: set[tuple[str | None, str | None, str | None]] = set()
    for token in tokens:
        key = (token.device_name, token.user_agent, token.ip_address)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(token)
    return deduped


@router.post("/auth/logout-device")
def logout_device(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = db.scalar(
        select(RefreshToken).where(
            RefreshToken.id == device_id,
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked_at.is_(None),
        )
    )
    if token:
        token.revoked_at = datetime.utcnow()
        db.commit()
    return {"status": "ok"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
