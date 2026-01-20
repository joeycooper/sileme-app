from datetime import datetime, timedelta
import random
import string

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, desc, func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    Checkin,
    Group,
    GroupEncouragement,
    GroupMember,
    GroupReminder,
    Notification,
    User,
)
from ..schemas import (
    GroupAnnouncementUpdate,
    GroupCreate,
    GroupDetailOut,
    GroupEncourageOut,
    GroupEncourageRequest,
    GroupJoinRequest,
    GroupMemberOut,
    GroupNameUpdate,
    GroupOut,
)
from ..security import get_current_user
from .social import get_user_local_date

router = APIRouter(prefix="/groups", tags=["groups"])

APPLY_COOLDOWN = timedelta(hours=24)


def generate_join_code(db: Session) -> str:
    while True:
        code = "".join(random.choices(string.digits, k=4))
        exists = db.scalar(select(Group.id).where(Group.join_code == code))
        if not exists:
            return code


def member_status(group: Group, member: GroupMember | None) -> str:
    if not member:
        return "none"
    return "pending" if member.status == "pending" else "member"


@router.get("", response_model=list[GroupOut])
def list_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    groups = list(db.scalars(select(Group).order_by(desc(Group.created_at))).all())
    results: list[GroupOut] = []
    today = get_user_local_date(current_user)
    for group in groups:
        member = db.scalar(
            select(GroupMember).where(
                GroupMember.group_id == group.id,
                GroupMember.user_id == current_user.id,
            )
        )
        members = list(
            db.scalars(
                select(GroupMember.user_id).where(
                    GroupMember.group_id == group.id,
                    GroupMember.status == "accepted",
                )
            ).all()
        )
        members_count = len(members)
        active_today = 0
        if members:
            active_today = db.scalar(
                select(func.count(Checkin.id)).where(
                    Checkin.user_id.in_(members),
                    Checkin.date == today,
                )
            )
        results.append(
            GroupOut(
                id=group.id,
                name=group.name,
                privacy=group.privacy,
                requires_approval=group.requires_approval,
                members_count=members_count,
                active_today=active_today or 0,
                unread_count=0,
                status=member_status(group, member),
            )
        )
    return results


@router.get("/{group_id}", response_model=GroupDetailOut)
def get_group_detail(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.scalar(select(Group).where(Group.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
        )
    )
    status = member_status(group, member)
    members_out: list[GroupMemberOut] = []
    announcement = group.announcement
    if status == "member":
        members = list(
            db.scalars(
                select(GroupMember).where(
                    GroupMember.group_id == group.id,
                    GroupMember.status == "accepted",
                )
            ).all()
        )
        for gm in members:
            user = db.scalar(select(User).where(User.id == gm.user_id))
            if not user:
                continue
            checked_in = bool(
                db.scalar(
                    select(Checkin.id).where(
                        Checkin.user_id == user.id, Checkin.date == get_user_local_date(user)
                    )
                )
            )
            members_out.append(
                GroupMemberOut(
                    id=user.id,
                    name=user.nickname or user.phone,
                    role=gm.role,
                    checked_in=checked_in,
                )
            )
    if group.privacy == "private" and status != "member":
        announcement = None
        members_out = []

    return GroupDetailOut(
        id=group.id,
        name=group.name,
        privacy=group.privacy,
        requires_approval=group.requires_approval,
        announcement=announcement,
        status=status,
        members=members_out,
        join_code=group.join_code if status == "member" and group.privacy == "private" else None,
    )


@router.post("", response_model=GroupDetailOut)
def create_group(
    payload: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    join_code = generate_join_code(db)
    group = Group(
        name=payload.name,
        privacy=payload.privacy,
        requires_approval=payload.requires_approval,
        join_code=join_code,
        owner_id=current_user.id,
        announcement="欢迎加入群组！",
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        role="owner",
        status="accepted",
        requested_at=datetime.utcnow(),
        approved_at=datetime.utcnow(),
    )
    db.add(member)
    db.commit()
    return GroupDetailOut(
        id=group.id,
        name=group.name,
        privacy=group.privacy,
        requires_approval=group.requires_approval,
        announcement=group.announcement,
        status="member",
        members=[
            GroupMemberOut(
                id=current_user.id,
                name=current_user.nickname or current_user.phone,
                role="owner",
                checked_in=False,
            )
        ],
        join_code=group.join_code if group.privacy == "private" else None,
    )


@router.post("/join", response_model=GroupDetailOut)
def join_group(
    payload: GroupJoinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    code_or_id = payload.code_or_id.strip()
    group = None
    if code_or_id.isdigit():
        group = db.scalar(select(Group).where(Group.id == int(code_or_id)))
    if not group:
        group = db.scalar(select(Group).where(Group.join_code == code_or_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if group.privacy == "private" and code_or_id != group.join_code:
        raise HTTPException(status_code=403, detail="Invite code required")

    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
        )
    )
    if member and member.status == "accepted":
        return get_group_detail(group.id, db, current_user)

    now = datetime.utcnow()
    requires_approval = group.requires_approval
    if group.privacy == "private":
        requires_approval = False

    if requires_approval:
        if member and member.status == "pending":
            if now - member.requested_at < APPLY_COOLDOWN:
                raise HTTPException(status_code=429, detail="Apply cooldown")
            member.requested_at = now
        elif member:
            member.status = "pending"
            member.requested_at = now
        else:
            member = GroupMember(
                group_id=group.id,
                user_id=current_user.id,
                role="member",
                status="pending",
                requested_at=now,
            )
            db.add(member)
        db.commit()
        admins = list(
            db.scalars(
                select(GroupMember.user_id).where(
                    GroupMember.group_id == group.id,
                    GroupMember.status == "accepted",
                    GroupMember.role.in_(("owner", "admin")),
                )
            ).all()
        )
        for admin_id in admins:
            db.add(
                Notification(
                    user_id=admin_id,
                    from_user_id=current_user.id,
                    related_group_id=group.id,
                    related_user_id=current_user.id,
                    kind="group_join_request",
                    message=f"{current_user.nickname or current_user.phone} 申请加入 {group.name}",
                )
            )
        db.commit()
        return GroupDetailOut(
            id=group.id,
            name=group.name,
            privacy=group.privacy,
            requires_approval=group.requires_approval,
            announcement=None if group.privacy == "private" else group.announcement,
            status="pending",
            members=[],
            join_code=None,
        )

    if member:
        member.status = "accepted"
        member.approved_at = now
    else:
        member = GroupMember(
            group_id=group.id,
            user_id=current_user.id,
            role="member",
            status="accepted",
            requested_at=now,
            approved_at=now,
        )
        db.add(member)
    db.commit()
    admins = list(
        db.scalars(
            select(GroupMember.user_id).where(
                GroupMember.group_id == group.id,
                GroupMember.status == "accepted",
                GroupMember.role.in_(("owner", "admin")),
            )
        ).all()
    )
    for admin_id in admins:
        if admin_id == current_user.id:
            continue
        db.add(
            Notification(
                user_id=admin_id,
                from_user_id=current_user.id,
                related_group_id=group.id,
                related_user_id=current_user.id,
                kind="group_joined",
                message=f"{current_user.nickname or current_user.phone} 已加入 {group.name}",
            )
        )
    db.commit()
    return get_group_detail(group.id, db, current_user)


@router.post("/{group_id}/name", response_model=GroupDetailOut)
def update_group_name(
    group_id: int,
    payload: GroupNameUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.scalar(select(Group).where(Group.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not member or member.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Not allowed")
    group.name = payload.name
    db.commit()
    return get_group_detail(group.id, db, current_user)


@router.post("/{group_id}/invite-code", response_model=GroupDetailOut)
def rotate_invite_code(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.scalar(select(Group).where(Group.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.privacy != "private":
        raise HTTPException(status_code=400, detail="Not a private group")
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not member or member.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Not allowed")
    group.join_code = generate_join_code(db)
    db.commit()
    return get_group_detail(group.id, db, current_user)


@router.post("/{group_id}/members/{user_id}/approve", response_model=GroupDetailOut)
def approve_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.scalar(select(Group).where(Group.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    admin = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not admin or admin.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Not allowed")
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == user_id,
            GroupMember.status == "pending",
        )
    )
    if not member:
        raise HTTPException(status_code=404, detail="Request not found")
    member.status = "accepted"
    member.approved_at = datetime.utcnow()
    admin_notice = db.scalar(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.related_group_id == group.id,
            Notification.related_user_id == user_id,
            Notification.kind == "group_join_request",
        )
    )
    if admin_notice:
        admin_notice.kind = "group_join_approved"
        admin_notice.message = "已通过该入群申请"
        admin_notice.read_at = datetime.utcnow()
    db.add(
        Notification(
            user_id=user_id,
            from_user_id=current_user.id,
            related_group_id=group.id,
            related_user_id=current_user.id,
            kind="group_join_approved",
            message=f"你已加入群组 {group.name}",
        )
    )
    db.commit()
    return get_group_detail(group.id, db, current_user)


@router.post("/{group_id}/members/{user_id}/reject", response_model=GroupDetailOut)
def reject_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.scalar(select(Group).where(Group.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    admin = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not admin or admin.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Not allowed")
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == user_id,
            GroupMember.status == "pending",
        )
    )
    if not member:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(member)
    admin_notice = db.scalar(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.related_group_id == group.id,
            Notification.related_user_id == user_id,
            Notification.kind == "group_join_request",
        )
    )
    if admin_notice:
        admin_notice.kind = "group_join_rejected"
        admin_notice.message = "已拒绝该入群申请"
        admin_notice.read_at = datetime.utcnow()
    db.add(
        Notification(
            user_id=user_id,
            from_user_id=current_user.id,
            related_group_id=group.id,
            related_user_id=current_user.id,
            kind="group_join_rejected",
            message=f"入群申请已被拒绝（{group.name}）",
        )
    )
    db.commit()
    return get_group_detail(group.id, db, current_user)


@router.post("/{group_id}/announcement", response_model=GroupDetailOut)
def update_announcement(
    group_id: int,
    payload: GroupAnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.scalar(select(Group).where(Group.id == group_id))
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not member or member.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Not allowed")
    group.announcement = payload.announcement
    db.commit()
    return get_group_detail(group.id, db, current_user)


@router.get("/{group_id}/encouragements", response_model=list[GroupEncourageOut])
def list_group_encouragements(
    group_id: int,
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not allowed")
    items = list(
        db.scalars(
            select(GroupEncouragement)
            .where(GroupEncouragement.group_id == group_id)
            .order_by(desc(GroupEncouragement.created_at))
            .limit(limit)
        ).all()
    )
    results: list[GroupEncourageOut] = []
    for item in items:
        author = db.scalar(select(User).where(User.id == item.user_id))
        results.append(
            GroupEncourageOut(
                id=item.id,
                author=author.nickname or author.phone if author else "成员",
                message=f"{item.emoji} {item.message or ''}".strip(),
                created_at=item.created_at,
            )
        )
    return results


@router.post("/{group_id}/encourage")
def group_encourage(
    group_id: int,
    payload: GroupEncourageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not allowed")
    record = GroupEncouragement(
        group_id=group_id,
        user_id=current_user.id,
        emoji=payload.emoji,
        message=payload.message,
    )
    db.add(record)
    db.commit()
    return {"sent": True}


@router.post("/{group_id}/remind")
def group_remind(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.status == "accepted",
        )
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.add(GroupReminder(group_id=group_id, user_id=current_user.id))
    db.commit()
    return {"sent": True}
