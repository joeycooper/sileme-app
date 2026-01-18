from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class CheckinBase(BaseModel):
    alive: bool = True
    sleep_hours: Optional[int] = Field(default=None, ge=0, le=24)
    energy: Optional[int] = Field(default=None, ge=1, le=5)
    mood: Optional[int] = Field(default=None, ge=1, le=5)
    note: Optional[str] = None


class CheckinCreate(CheckinBase):
    pass


class CheckinOut(CheckinBase):
    id: int
    date: date

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    streak_days: int
    checkin_rate: float
    avg_sleep_hours: float
    total_days: int
    checkins: int
    window_days: int
