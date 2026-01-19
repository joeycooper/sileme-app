# 死了么（SiLeMe）App

一个轻量的「每日报平安打卡」应用，支持多用户登录、打卡、统计与个人设置。可在电脑与手机上使用。

## 功能概览
- 一键打卡「我还活着」
- 每天最多一条打卡（按日期唯一，重复提交会更新）
- 统计概览：连续天数、平均睡眠、趋势图
- 历史页：最近 30 天记录、详情展开与编辑、热力图
- 登录/注册（手机号 + 密码 + Mock 验证码）
- 个人设置：昵称/头像/微信/邮箱、自动警报时间、遗产说明
- 紧急联系人：首选 1 个、备选多个（头像可上传）
- 社交：好友添加、提醒/鼓励、站内通知

## 新增功能说明
- 趋势图：支持 14/30/90 天切换，展示睡眠/精力/心情曲线
- 趋势图：打卡数据不足 5 天时不展示曲线
- 热力图：最近 180 天打卡日历热力图，按月标记
- 最近记录：默认展示最近 10 条，按钮加载更多
- 详情与编辑：点击记录展开详情，可编辑最近 N 天（默认 7 天）
- 社交：点击「添加好友」弹出表单，站内通知按好友折叠

## PRD 文档
- 合并版：`PRD-social.md`
- 拆分版：
  - `PRD/01-overview.md`
  - `PRD/02-features.md`
  - `PRD/03-flows.md`
  - `PRD/04-data-model.md`
  - `PRD/05-apis.md`
  - `PRD/06-metrics.md`
  - `PRD/07-flow-diagrams.md`
  - `PRD/08-api-examples.md`
  - `PRD/09-frontend-wire.md`
  - `PRD/10-db-details.md`

## 技术栈
- 后端：FastAPI + SQLAlchemy + SQLite
- 前端：React + TypeScript + Vite

## 本地启动（常用）

### 1) 启动后端
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) 启动前端
```bash
cd frontend
npm install
npm run dev
```

浏览器访问：`http://localhost:5173`

## 局域网手机访问（无需改 IP）
前端已改为 `/api` 代理，后端走 `localhost:8000`，无需每次改 `.env.local`。

1) 启动后端（同上）
2) 启动前端并自动打印手机地址/二维码：
```bash
cd frontend
npm run dev:lan
```
3) 手机访问脚本输出的地址，例如：
```
http://<你的电脑名>.local:5173
```

如需二维码显示，请先安装：
```bash
brew install qrencode
```

## 外网访问（可选）
使用 Cloudflare Tunnel：
```bash
cloudflared tunnel --url http://localhost:5173
```
它会输出一个公网 URL，手机外网可直接访问。

## 配置说明
- `frontend/.env.local` 默认：`VITE_API_BASE=/api`
- 后端 CORS 已允许 `*.local:5173` 与局域网 IP
- `CHECKIN_EDIT_WINDOW_DAYS`：历史记录可编辑天数（默认 7）

## API 概览
- `POST /auth/register`：注册（手机号 + 密码 + sms_code=123456）
- `POST /auth/login`：登录
- `POST /auth/refresh`：刷新 token
- `POST /auth/logout`：退出
- `GET /me`：获取个人信息
- `PUT /me/profile`：更新个人信息
- `GET /me/contacts`：获取联系人
- `PUT /me/contacts`：更新联系人
- `POST /checkins/today`：今日打卡（幂等）
- `GET /checkins/today`：获取今日打卡
- `PUT /checkins/{date}`：更新某天打卡（受编辑天数限制）
- `GET /checkins?limit=&offset=&order=`：分页查询
- `GET /checkins/stats`：统计
- `GET /checkins/summary?days=`：趋势/热力图汇总（最多 180 天）
- `POST /friends/request`：发送好友请求
- `POST /friends/accept`：通过好友请求
- `GET /friends`：好友列表
- `GET /friends/{id}`：好友详情
- `GET /friends/{id}/permission`：获取好友权限
- `POST /friends/{id}/permission`：更新好友权限
- `POST /friends/{id}/remind`：提醒打卡
- `POST /friends/{id}/encourage`：发送鼓励
- `GET /notifications?limit=`：站内通知列表
- `POST /notifications/{id}/read`：标记已读
- `POST /notifications/read-all`：全部已读

## 数据库迁移（SQLite）
如果升级后出现 `no such column`，需要执行迁移或重建数据库：

### 社交功能新增表（执行 SQL 迁移）
停止后端后执行：
```bash
sqlite3 backend/checkins.db <<'SQL'
CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  blocked_by INTEGER,
  message TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(friend_id) REFERENCES users(id),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS friend_settings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  can_view_detail BOOLEAN NOT NULL DEFAULT 0,
  can_remind BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(friend_id) REFERENCES users(id),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(from_user_id) REFERENCES users(id),
  FOREIGN KEY(to_user_id) REFERENCES users(id),
  UNIQUE(from_user_id, to_user_id, date)
);

CREATE TABLE IF NOT EXISTS encouragements (
  id INTEGER PRIMARY KEY,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  checkin_date DATE NOT NULL,
  emoji TEXT NOT NULL,
  message TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(from_user_id) REFERENCES users(id),
  FOREIGN KEY(to_user_id) REFERENCES users(id)
);
SQL
```

也可以直接执行迁移文件：
```bash
sqlite3 backend/checkins.db < backend/migrations/social.sql
```

分步执行（按顺序）：
```bash
sqlite3 backend/checkins.db < backend/migrations/social/001_friendships.sql
sqlite3 backend/checkins.db < backend/migrations/social/002_friend_settings.sql
sqlite3 backend/checkins.db < backend/migrations/social/003_reminders.sql
sqlite3 backend/checkins.db < backend/migrations/social/004_encouragements.sql
sqlite3 backend/checkins.db < backend/migrations/social/005_notifications.sql
```

回滚（删除社交相关表）：
```bash
sqlite3 backend/checkins.db < backend/migrations/social/rollback.sql
```

### 方式 A：保留数据（执行 SQL 迁移）
停止后端后执行：
```bash
sqlite3 backend/checkins.db <<'SQL'
ALTER TABLE users ADD COLUMN nickname TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN wechat TEXT;
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN alarm_hours INTEGER DEFAULT 24;
ALTER TABLE users ADD COLUMN estate_note TEXT;
ALTER TABLE users ADD COLUMN last_checkin_at DATETIME;

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  wechat TEXT,
  email TEXT,
  note TEXT,
  avatar_url TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
SQL
```

### 方式 B：不保留数据（删库重建）
```bash
rm -f backend/checkins.db
```

## License
MIT
