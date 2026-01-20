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
    nickname: str | None = None
    avatar_url: str | None = None
    wechat: str | None = None
    email: str | None = None
    alarm_hours: int
    estate_note: str | None = None
    last_checkin_at: datetime | None = None
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


class ProfileUpdate(BaseModel):
    nickname: str | None = None
    avatar_url: str | None = None
    wechat: str | None = None
    email: str | None = None
    alarm_hours: int = Field(default=24, ge=1, le=72)
    estate_note: str | None = None


class ContactIn(BaseModel):
    name: str
    relation: str
    phone: str
    wechat: str | None = None
    email: str | None = None
    note: str | None = None
    avatar_url: str | None = None


class ContactsPayload(BaseModel):
    primary: ContactIn
    backups: list[ContactIn] = []


class ContactOut(ContactIn):
    id: int
    kind: str

    class Config:
        from_attributes = True


class ContactsOut(BaseModel):
    primary: ContactOut | None = None
    backups: list[ContactOut] = []


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


class FriendRequest(BaseModel):
    phone: str = Field(pattern=r"^1[3-9]\d{9}$")
    message: str | None = Field(default=None, max_length=140)


class FriendAccept(BaseModel):
    friend_id: int


class FriendPermissionUpdate(BaseModel):
    can_view_detail: bool
    can_remind: bool


class FriendPermissionOut(BaseModel):
    can_view_detail: bool
    can_remind: bool


class FriendOut(BaseModel):
    id: int
    nickname: str | None = None
    avatar_url: str | None = None
    status: str
    today_checked_in: bool
    streak_days: int
    message: str | None = None


class FriendDetailOut(BaseModel):
    id: int
    phone: str
    nickname: str | None = None
    avatar_url: str | None = None
    status: str
    today_checked_in: bool
    streak_days: int
    last_checkin_at: datetime | None = None
    permission: FriendPermissionOut


class EncourageRequest(BaseModel):
    emoji: str = Field(min_length=1, max_length=16)
    message: str | None = Field(default=None, max_length=140)


class RemindOut(BaseModel):
    sent: bool
    limited: bool


class NotificationOut(BaseModel):
    id: int
    kind: str
    message: str
    from_user_id: int | None
    from_user_name: str | None = None
    from_user_avatar: str | None = None
    related_group_id: int | None = None
    related_group_name: str | None = None
    related_user_id: int | None = None
    related_user_name: str | None = None
    created_at: datetime
    read_at: datetime | None = None

    class Config:
        from_attributes = True


class NotificationReadOut(BaseModel):
    id: int
    read_at: datetime


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    privacy: str = Field(pattern=r"^(public|private)$")
    requires_approval: bool = True


class GroupJoinRequest(BaseModel):
    code_or_id: str


class GroupMemberOut(BaseModel):
    id: int
    name: str
    role: str
    checked_in: bool


class GroupOut(BaseModel):
    id: int
    name: str
    privacy: str
    requires_approval: bool
    members_count: int
    active_today: int
    unread_count: int = 0
    status: str  # member | pending | none


class GroupDetailOut(BaseModel):
    id: int
    name: str
    privacy: str
    requires_approval: bool
    announcement: str | None = None
    status: str
    members: list[GroupMemberOut] = []
    join_code: str | None = None


class GroupAnnouncementUpdate(BaseModel):
    announcement: str = Field(min_length=1, max_length=200)


class GroupNameUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=64)


class GroupEncourageRequest(BaseModel):
    emoji: str = Field(min_length=1, max_length=16)
    message: str | None = Field(default=None, max_length=140)


class GroupEncourageOut(BaseModel):
    id: int
    author: str
    message: str
    created_at: datetime
