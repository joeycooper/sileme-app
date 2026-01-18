from datetime import date, datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Checkin, User
from ..schemas import CheckinCreate, CheckinOut, StatsOut
from ..security import get_current_user

router = APIRouter(prefix="/checkins", tags=["checkins"])


def get_user_local_date(user: User) -> date:
    try:
        tz = ZoneInfo(user.timezone)
    except ZoneInfoNotFoundError:
        tz = ZoneInfo("UTC")
    return datetime.now(tz).date()


@router.post("/today", response_model=CheckinOut)
def upsert_today(
    payload: CheckinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = get_user_local_date(current_user)
    existing = db.scalar(
        select(Checkin).where(
            Checkin.date == today,
            Checkin.user_id == current_user.id,
        )
    )
    if existing:
        for field, value in payload.model_dump().items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    checkin = Checkin(user_id=current_user.id, date=today, **payload.model_dump())
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return checkin


@router.get("/today", response_model=CheckinOut)
def get_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = get_user_local_date(current_user)
    checkin = db.scalar(
        select(Checkin).where(
            Checkin.date == today,
            Checkin.user_id == current_user.id,
        )
    )
    if not checkin:
        raise HTTPException(status_code=404, detail="No check-in for today")
    return checkin


@router.get("", response_model=list[CheckinOut])
def list_checkins(
    from_date: Optional[date] = Query(default=None, alias="from"),
    to_date: Optional[date] = Query(default=None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Checkin).where(Checkin.user_id == current_user.id)
    if from_date:
        stmt = stmt.where(Checkin.date >= from_date)
    if to_date:
        stmt = stmt.where(Checkin.date <= to_date)
    stmt = stmt.order_by(Checkin.date.asc())
    return list(db.scalars(stmt).all())


@router.get("/stats", response_model=StatsOut)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = get_user_local_date(current_user)
    window_days = 30
    start_date = today - timedelta(days=window_days - 1)

    stmt = select(Checkin).where(
        Checkin.date >= start_date,
        Checkin.date <= today,
        Checkin.user_id == current_user.id,
    )
    checkins = list(db.scalars(stmt).all())
    dates = {c.date for c in checkins}

    streak = 0
    cursor = today
    for _ in range(window_days):
        if cursor in dates:
            streak += 1
            cursor -= timedelta(days=1)
        else:
            break

    checkin_rate = len(checkins) / window_days

    sleep_values = [c.sleep_hours for c in checkins if c.sleep_hours is not None]
    avg_sleep = sum(sleep_values) / len(sleep_values) if sleep_values else 0.0

    return StatsOut(
        streak_days=streak,
        checkin_rate=round(checkin_rate, 3),
        avg_sleep_hours=round(avg_sleep, 2),
        total_days=window_days,
        checkins=len(checkins),
        window_days=window_days,
    )
