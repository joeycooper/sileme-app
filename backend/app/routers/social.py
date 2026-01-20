from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Checkin, Encouragement, FriendSetting, Friendship, Notification, Reminder, User
from ..schemas import (
    EncourageRequest,
    FriendAccept,
    FriendDetailOut,
    FriendOut,
    FriendPermissionOut,
    FriendPermissionUpdate,
    FriendRequest,
    RemindOut,
)
from ..security import get_current_user

router = APIRouter(prefix="/friends", tags=["friends"])

REMINDER_DAILY_LIMIT = 1
STREAK_WINDOW_DAYS = 30


def get_user_local_date(user: User) -> date:
    try:
        tz = ZoneInfo(user.timezone)
    except ZoneInfoNotFoundError:
        tz = ZoneInfo("UTC")
    return datetime.now(tz).date()


def get_streak_days(db: Session, user: User) -> int:
    today = get_user_local_date(user)
    start_date = today - timedelta(days=STREAK_WINDOW_DAYS - 1)
    stmt = select(Checkin.date).where(
        Checkin.user_id == user.id,
        Checkin.date >= start_date,
        Checkin.date <= today,
    )
    dates = {row for row in db.scalars(stmt).all()}
    streak = 0
    cursor = today
    for _ in range(STREAK_WINDOW_DAYS):
        if cursor in dates:
            streak += 1
            cursor -= timedelta(days=1)
        else:
            break
    return streak


def find_friendship(db: Session, user_id: int, friend_id: int) -> Friendship | None:
    return db.scalar(
        select(Friendship).where(
            or_(
                and_(Friendship.user_id == user_id, Friendship.friend_id == friend_id),
                and_(Friendship.user_id == friend_id, Friendship.friend_id == user_id),
            )
        )
    )


def ensure_friend_settings(db: Session, user_id: int, friend_id: int) -> None:
    existing = db.scalar(
        select(FriendSetting).where(
            FriendSetting.user_id == user_id,
            FriendSetting.friend_id == friend_id,
        )
    )
    if existing:
        return
    db.add(FriendSetting(user_id=user_id, friend_id=friend_id))


def to_friend_out(db: Session, current_user: User, friendship: Friendship, friend: User) -> FriendOut:
    today = get_user_local_date(friend)
    checked_in = db.scalar(
        select(Checkin.id).where(Checkin.user_id == friend.id, Checkin.date == today)
    )
    if friendship.status == "pending":
        status_label = "pending_out" if friendship.user_id == current_user.id else "pending_in"
    else:
        status_label = friendship.status
    return FriendOut(
        id=friend.id,
        nickname=friend.nickname,
        avatar_url=friend.avatar_url,
        status=status_label,
        today_checked_in=bool(checked_in),
        streak_days=get_streak_days(db, friend),
        message=friendship.message,
    )


@router.post("/request", response_model=FriendOut)
def request_friend(
    payload: FriendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target = db.scalar(select(User).where(User.phone == payload.phone))
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself")

    existing = find_friendship(db, current_user.id, target.id)
    if existing:
        if existing.status == "accepted":
            raise HTTPException(status_code=400, detail="Already friends")
        if existing.status == "blocked":
            raise HTTPException(status_code=403, detail="Blocked")
        if existing.status == "pending" and existing.user_id == target.id:
            existing.status = "accepted"
            existing.blocked_by = None
            db.commit()
            ensure_friend_settings(db, current_user.id, target.id)
            ensure_friend_settings(db, target.id, current_user.id)
            db.commit()
            return to_friend_out(db, current_user, existing, target)
        if existing.status == "pending" and existing.user_id == current_user.id:
            if payload.message is not None:
                existing.message = payload.message
                db.commit()
        return to_friend_out(db, current_user, existing, target)

    friendship = Friendship(
        user_id=current_user.id,
        friend_id=target.id,
        status="pending",
        message=payload.message,
    )
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    return to_friend_out(db, current_user, friendship, target)


@router.post("/accept", response_model=FriendOut)
def accept_friend(
    payload: FriendAccept,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = db.scalar(
        select(Friendship).where(
            Friendship.user_id == payload.friend_id,
            Friendship.friend_id == current_user.id,
            Friendship.status == "pending",
        )
    )
    if not friendship:
        raise HTTPException(status_code=404, detail="Request not found")
    friendship.status = "accepted"
    friendship.blocked_by = None
    ensure_friend_settings(db, current_user.id, payload.friend_id)
    ensure_friend_settings(db, payload.friend_id, current_user.id)
    db.commit()
    friend = db.scalar(select(User).where(User.id == payload.friend_id))
    return to_friend_out(db, current_user, friendship, friend)


@router.get("", response_model=list[FriendOut])
def list_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Friendship).where(
        or_(Friendship.user_id == current_user.id, Friendship.friend_id == current_user.id)
    )
    friendships = list(db.scalars(stmt).all())
    results: list[FriendOut] = []
    for friendship in friendships:
        if friendship.status == "blocked":
            continue
        friend_id = (
            friendship.friend_id if friendship.user_id == current_user.id else friendship.user_id
        )
        friend = db.scalar(select(User).where(User.id == friend_id))
        results.append(to_friend_out(db, current_user, friendship, friend))
    return results


@router.get("/{friend_id}", response_model=FriendDetailOut)
def get_friend_detail(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = find_friendship(db, current_user.id, friend_id)
    if not friendship or friendship.status == "blocked":
        raise HTTPException(status_code=404, detail="Friend not found")
    friend = db.scalar(select(User).where(User.id == friend_id))
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    permission = db.scalar(
        select(FriendSetting).where(
            FriendSetting.user_id == current_user.id,
            FriendSetting.friend_id == friend_id,
        )
    )
    if permission:
        permission_out = FriendPermissionOut(
            can_view_detail=permission.can_view_detail,
            can_remind=permission.can_remind,
        )
    else:
        permission_out = FriendPermissionOut(can_view_detail=False, can_remind=True)

    friend_out = to_friend_out(db, current_user, friendship, friend)
    return FriendDetailOut(
        id=friend.id,
        phone=friend.phone,
        nickname=friend.nickname,
        avatar_url=friend.avatar_url,
        status=friend_out.status,
        today_checked_in=friend_out.today_checked_in,
        streak_days=friend_out.streak_days,
        last_checkin_at=friend.last_checkin_at,
        permission=permission_out,
    )


@router.post("/{friend_id}/permission", response_model=FriendPermissionOut)
def update_permission(
    friend_id: int,
    payload: FriendPermissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = find_friendship(db, current_user.id, friend_id)
    if not friendship or friendship.status == "blocked":
        raise HTTPException(status_code=404, detail="Friend not found")
    setting = db.scalar(
        select(FriendSetting).where(
            FriendSetting.user_id == current_user.id,
            FriendSetting.friend_id == friend_id,
        )
    )
    if setting:
        setting.can_view_detail = payload.can_view_detail
        setting.can_remind = payload.can_remind
    else:
        setting = FriendSetting(
            user_id=current_user.id,
            friend_id=friend_id,
            can_view_detail=payload.can_view_detail,
            can_remind=payload.can_remind,
        )
        db.add(setting)
    db.commit()
    return FriendPermissionOut(
        can_view_detail=setting.can_view_detail,
        can_remind=setting.can_remind,
    )


@router.get("/{friend_id}/permission", response_model=FriendPermissionOut)
def get_permission(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = find_friendship(db, current_user.id, friend_id)
    if not friendship or friendship.status == "blocked":
        raise HTTPException(status_code=404, detail="Friend not found")
    setting = db.scalar(
        select(FriendSetting).where(
            FriendSetting.user_id == current_user.id,
            FriendSetting.friend_id == friend_id,
        )
    )
    if setting:
        return FriendPermissionOut(
            can_view_detail=setting.can_view_detail,
            can_remind=setting.can_remind,
        )
    return FriendPermissionOut(can_view_detail=False, can_remind=True)


@router.post("/{friend_id}/remind", response_model=RemindOut)
def remind_friend(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = find_friendship(db, current_user.id, friend_id)
    if not friendship or friendship.status != "accepted":
        raise HTTPException(status_code=404, detail="Friend not found")

    target = db.scalar(select(User).where(User.id == friend_id))
    if not target:
        raise HTTPException(status_code=404, detail="Friend not found")

    target_setting = db.scalar(
        select(FriendSetting).where(
            FriendSetting.user_id == friend_id,
            FriendSetting.friend_id == current_user.id,
        )
    )
    if target_setting and not target_setting.can_remind:
        raise HTTPException(status_code=403, detail="Reminders disabled")

    reminder_date = get_user_local_date(target)
    count = db.scalar(
        select(Reminder).where(
            Reminder.from_user_id == current_user.id,
            Reminder.to_user_id == friend_id,
            Reminder.date == reminder_date,
        )
    )
    if count:
        return RemindOut(sent=False, limited=True)

    db.add(Reminder(from_user_id=current_user.id, to_user_id=friend_id, date=reminder_date))
    db.add(
        Notification(
            user_id=friend_id,
            from_user_id=current_user.id,
            kind="remind",
            message="提醒你打卡啦",
        )
    )
    db.commit()
    return RemindOut(sent=True, limited=False)


@router.post("/{friend_id}/encourage")
def encourage_friend(
    friend_id: int,
    payload: EncourageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    friendship = find_friendship(db, current_user.id, friend_id)
    if not friendship or friendship.status != "accepted":
        raise HTTPException(status_code=404, detail="Friend not found")
    target = db.scalar(select(User).where(User.id == friend_id))
    if not target:
        raise HTTPException(status_code=404, detail="Friend not found")
    checkin_date = get_user_local_date(target)
    record = Encouragement(
        from_user_id=current_user.id,
        to_user_id=friend_id,
        checkin_date=checkin_date,
        emoji=payload.emoji,
        message=payload.message,
    )
    db.add(record)
    db.add(
        Notification(
            user_id=friend_id,
            from_user_id=current_user.id,
            kind="encourage",
            message=f"给你加油 {payload.emoji}",
        )
    )
    db.commit()
    return {"sent": True}
