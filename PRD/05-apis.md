# 社交功能 PRD - 接口定义

## 好友
- `POST /friends/request` 发起好友请求
- `POST /friends/accept` 接受请求
- `GET /friends` 好友列表
- `GET /friends/{id}` 好友详情
- `POST /friends/{id}/block` 拉黑

## 授权
- `POST /friends/{id}/permission` 设置授权
- `GET /friends/{id}/permission` 获取授权状态

## 提醒与鼓励
- `POST /friends/{id}/remind` 发送提醒
- `POST /friends/{id}/encourage` 发送鼓励
- `GET /encouragements?date=` 获取鼓励列表

## 群组（可选）
- `POST /groups` 创建群组
- `POST /groups/{id}/join` 加入群组
- `GET /groups/{id}` 群详情
- `POST /groups/{id}/remind` 群提醒

## 附近（可选）
- `GET /nearby/checkins` 附近打卡列表
- `POST /nearby/optin` 开启附近展示
- `POST /nearby/optout` 关闭附近展示
