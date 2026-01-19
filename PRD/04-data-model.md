# 社交功能 PRD - 数据模型

## users
- id (PK)
- phone
- nickname
- avatar_url
- timezone
- created_at

## friendships
- id (PK)
- user_id (FK)
- friend_id (FK)
- status (pending/accepted/blocked)
- created_at

## friend_settings
- id (PK)
- user_id
- friend_id
- can_view_detail (bool)
- can_remind (bool)
- created_at

## reminders
- id (PK)
- from_user_id
- to_user_id
- date
- created_at

## encouragements
- id (PK)
- from_user_id
- to_user_id
- checkin_date
- emoji
- message
- created_at

## groups（可选）
- id (PK)
- name
- owner_id
- created_at

## group_members（可选）
- id (PK)
- group_id
- user_id
- role (owner/admin/member)
- created_at

## nearby_checkins（可选）
- id (PK)
- user_id
- lat
- lng
- date
- visible (bool)
- created_at
