from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Notification, User
from ..schemas import NotificationOut, NotificationReadOut
from ..security import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    limit: int = Query(default=30, ge=1, le=100),
    unread_only: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Notification).where(Notification.user_id == current_user.id)
    if unread_only:
        stmt = stmt.where(Notification.read_at.is_(None))
    stmt = stmt.order_by(desc(Notification.created_at)).limit(limit)
    notifications = list(db.scalars(stmt).all())

    results: list[NotificationOut] = []
    for item in notifications:
        from_user_name = None
        from_user_avatar = None
        if item.from_user_id:
            from_user = db.scalar(select(User).where(User.id == item.from_user_id))
            if from_user:
                from_user_name = from_user.nickname or from_user.phone
                from_user_avatar = from_user.avatar_url
        results.append(
            NotificationOut(
                id=item.id,
                kind=item.kind,
                message=item.message,
                from_user_id=item.from_user_id,
                from_user_name=from_user_name,
                from_user_avatar=from_user_avatar,
                created_at=item.created_at,
                read_at=item.read_at,
            )
        )
    return results


@router.post("/{notification_id}/read", response_model=NotificationReadOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.read_at:
        return NotificationReadOut(id=notification.id, read_at=notification.read_at)
    notification.read_at = datetime.utcnow()
    db.commit()
    return NotificationReadOut(id=notification.id, read_at=notification.read_at)


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    notifications = list(
        db.scalars(
            select(Notification).where(
                Notification.user_id == current_user.id,
                Notification.read_at.is_(None),
            )
        ).all()
    )
    for item in notifications:
        item.read_at = now
    db.commit()
    return {"count": len(notifications), "read_at": now}
