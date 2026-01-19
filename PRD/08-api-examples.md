# 社交功能 PRD - 接口参数与示例

## 1. 好友
### POST /friends/request
**请求**
```json
{
  "phone": "13800138000",
  "message": "一起打卡吧"
}
```
**响应**
```json
{
  "id": 101,
  "status": "pending_out",
  "created_at": "2025-01-20T08:00:00Z"
}
```

### POST /friends/accept
**请求**
```json
{ "request_id": 101 }
```
**响应**
```json
{ "status": "accepted" }
```

### GET /friends
**响应**
```json
[
  {
    "id": 12,
    "nickname": "小赵",
    "avatar_url": "https://...",
    "status": "accepted",
    "today_checked_in": true,
    "streak_days": 7
  }
]
```

## 2. 授权
### POST /friends/{id}/permission
**请求**
```json
{
  "can_view_detail": true,
  "can_remind": true
}
```
**响应**
```json
{ "success": true }
```

## 3. 提醒与鼓励
### POST /friends/{id}/remind
**响应**
```json
{ "sent": true, "limited": false }
```

### POST /friends/{id}/encourage
**请求**
```json
{
  "emoji": "💪",
  "message": "加油！"
}
```
**响应**
```json
{ "sent": true }
```

## 4. 群组（可选）
### POST /groups
**请求**
```json
{ "name": "一家人" }
```
**响应**
```json
{ "id": 301, "name": "一家人" }
```

## 5. 附近（可选）
### POST /nearby/optin
**请求**
```json
{ "lat": 31.2304, "lng": 121.4737 }
```
**响应**
```json
{ "enabled": true }
```
