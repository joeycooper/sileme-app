from datetime import date, datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Checkin, User
from ..schemas import CheckinCreate, CheckinOut, StatsOut, SummaryOut, DailySummary
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
        current_user.last_checkin_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    checkin = Checkin(user_id=current_user.id, date=today, **payload.model_dump())
    db.add(checkin)
    current_user.last_checkin_at = datetime.utcnow()
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
    limit: int = Query(default=30, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Checkin).where(Checkin.user_id == current_user.id)
    if from_date:
        stmt = stmt.where(Checkin.date >= from_date)
    if to_date:
        stmt = stmt.where(Checkin.date <= to_date)
    if order == "asc":
        stmt = stmt.order_by(Checkin.date.asc())
    else:
        stmt = stmt.order_by(Checkin.date.desc())
    stmt = stmt.limit(limit).offset(offset)
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


@router.get("/summary", response_model=SummaryOut)
def get_summary(
    days: int = Query(default=14, ge=1, le=120),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = get_user_local_date(current_user)
    start_date = today - timedelta(days=days - 1)
    stmt = select(Checkin).where(
        Checkin.date >= start_date,
        Checkin.date <= today,
        Checkin.user_id == current_user.id,
    )
    checkins = list(db.scalars(stmt).all())
    by_date = {c.date: c for c in checkins}

    items: list[DailySummary] = []
    sleep_values: list[int] = []
    mood_values: list[int] = []
    energy_values: list[int] = []

    for i in range(days):
        d = start_date + timedelta(days=i)
        c = by_date.get(d)
        if c:
            if c.sleep_hours is not None:
                sleep_values.append(c.sleep_hours)
            if c.mood is not None:
                mood_values.append(c.mood)
            if c.energy is not None:
                energy_values.append(c.energy)
            items.append(
                DailySummary(
                    date=d,
                    checked_in=True,
                    sleep_hours=c.sleep_hours,
                    energy=c.energy,
                    mood=c.mood,
                )
            )
        else:
            items.append(
                DailySummary(
                    date=d,
                    checked_in=False,
                    sleep_hours=None,
                    energy=None,
                    mood=None,
                )
            )

    checkin_rate = len(checkins) / days
    avg_sleep = sum(sleep_values) / len(sleep_values) if sleep_values else 0.0
    avg_mood = sum(mood_values) / len(mood_values) if mood_values else 0.0
    avg_energy = sum(energy_values) / len(energy_values) if energy_values else 0.0

    return SummaryOut(
        days=days,
        checkins=len(checkins),
        checkin_rate=round(checkin_rate, 3),
        avg_sleep_hours=round(avg_sleep, 2),
        avg_energy=round(avg_energy, 2),
        avg_mood=round(avg_mood, 2),
        items=items,
    )
