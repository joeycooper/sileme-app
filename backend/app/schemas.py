from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    phone: str = Field(pattern=r"^1[3-9]\d{9}$")
    password: str = Field(min_length=8, max_length=128)
    timezone: str = "Asia/Shanghai"
    sms_code: str = Field(min_length=4, max_length=8)


class UserOut(BaseModel):
    id: int
    phone: str
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    phone: str = Field(pattern=r"^1[3-9]\d{9}$")
    password: str = Field(min_length=8, max_length=128)
    device_name: str | None = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    access_expires_in: int
    refresh_expires_in: int
    refresh_token_id: int


class RefreshRequest(BaseModel):
    refresh_token: str


class SmsRequest(BaseModel):
    phone: str = Field(pattern=r"^1[3-9]\d{9}$")


class DeviceOut(BaseModel):
    id: int
    device_name: str | None
    user_agent: str | None
    ip_address: str | None
    created_at: datetime
    expires_at: datetime
    revoked_at: datetime | None

    class Config:
        from_attributes = True


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


class DailySummary(BaseModel):
    date: date
    checked_in: bool
    sleep_hours: int | None
    energy: int | None
    mood: int | None


class SummaryOut(BaseModel):
    days: int
    checkins: int
    checkin_rate: float
    avg_sleep_hours: float
    avg_energy: float
    avg_mood: float
    items: list[DailySummary]
