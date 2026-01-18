# 死了么（SiLeMe）App

一个极简的本地单用户「每日报平安打卡」应用。通过简单的打卡与可选的自评信息（睡眠、精力、心情、备注），帮助你持续记录最近的状态，并在首页查看近 30 天的统计概览。

## 功能概览
- 今日打卡：一键「我还活着 ✅」
- 可选表单：睡眠时长、精力、心情、备注
- 每天最多一条打卡（按日期唯一，重复提交会更新）
- 统计卡片：连续打卡天数、30 天打卡率、平均睡眠

## 技术栈
- 后端：FastAPI + SQLAlchemy + SQLite
- 前端：React + TypeScript + Vite

## 项目结构
```
backend/
  app/
    main.py
    db.py
    models.py
    schemas.py
    routers/checkins.py
frontend/
  src/
    pages/Home.tsx
    services/api.ts
```

## 快速开始

### 1) 启动后端
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

后端会自动创建本地数据库文件 `backend/checkins.db`。

### 2) 启动前端
```bash
cd frontend
npm install
npm run dev
```

浏览器访问：`http://localhost:5173`

## API 一览
- `POST /checkins/today`：今日打卡（幂等，已存在则更新）
- `GET /checkins/today`：获取今日打卡
- `GET /checkins?from=&to=`：按日期区间查询
- `GET /checkins/stats`：最近 30 天统计

## 统计口径说明
- 连续天数：从今天往回连续有打卡的天数
- 打卡率：最近 30 天打卡天数 / 30
- 平均睡眠：最近 30 天打卡里有填写睡眠的平均值

## 开发说明
- 本项目为本地单用户 MVP，不包含登录/鉴权。
- 后端默认 CORS 放行 `http://localhost:5173`。

## License
MIT
