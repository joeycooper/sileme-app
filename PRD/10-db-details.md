# 社交功能 PRD - 数据库字段与约束

## friendships
**索引**
- `(user_id, friend_id)` unique
- `status` index

**约束**
- user_id != friend_id
- status 仅允许 pending/accepted/blocked

## friend_settings
**索引**
- `(user_id, friend_id)` unique

**字段**
- `can_view_detail` bool 默认 false
- `can_remind` bool 默认 true

## reminders
**索引**
- `(from_user_id, to_user_id, date)` unique

**约束**
- date 以用户本地日为准
- 同一好友每日限频

## encouragements
**索引**
- `(to_user_id, checkin_date)` index

**字段**
- emoji 仅允许预定义集合
- message 长度限制（例如 140）

## groups（可选）
**索引**
- `owner_id` index

**约束**
- name 长度限制（例如 24）

## group_members（可选）
**索引**
- `(group_id, user_id)` unique
- `role` index

**约束**
- role 仅允许 owner/admin/member

## nearby_checkins（可选）
**索引**
- `(date)` index
- `(lat, lng)` geohash 索引

**字段**
- visible 默认 false
- lat/lng 精度截断（例如 3-4 位小数）
