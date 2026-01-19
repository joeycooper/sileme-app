# 社交功能 PRD（SiLeMe）

## 1. 背景与目标
SiLeMe 是一款轻量日报平安打卡应用，核心价值是“持续打卡+互相照应”。社交功能目标是通过可信关系链提高打卡率与连续天数，并在不增加负担的前提下提供提醒、鼓励与监督。

**目标**
- 提升打卡率与连续天数
- 让用户能确认亲友是否按时打卡
- 提供轻量鼓励与提醒

**非目标**
- 不做强社交（私信、动态长文、陌生人强绑定）
- 不默认公开详细健康信息

## 2. 术语
- 打卡状态：是否在当日提交记录
- 详情：睡眠、精力、心情、备注等具体内容
- 监督：好友之间的提醒与鼓励
- 附近：匿名的地理位置打卡广场

## 3. 用户画像与场景
**画像**
- 个人用户：希望记录每日状态
- 家人/伴侣：想确认对方是否安全
- 同事/朋友：互相监督打卡

**场景**
- 忙碌一天忘记打卡：好友提醒一次
- 家人想确认平安：只看“今日是否打卡”
- 连续打卡达标：好友点赞鼓励
- 匿名鼓励：附近匿名点赞

## 4. 体验原则
- 默认最小暴露（只展示状态）
- 操作最少步骤（提醒一键、鼓励一键）
- 限频与不打扰（提醒次数有限）
- 可控权限（随时取消授权）

## 5. 功能范围与优先级
### P0（首期）
- 好友系统（添加/确认/备注/关系）
- 好友打卡状态可见（仅“已打卡/未打卡+连续天数”）
- 一键提醒与一键打气
- 详情授权（按好友单独授权）

### P1（次期）
- 群组（家庭/团队）
- 群内提醒
- 勋章与成就展示

### P2（后期）
- 附近匿名打卡广场
- 轻量动态流（仅“已打卡/连续天数”）

## 6. 功能详述
### 6.1 好友
**添加方式**
- 手机号搜索
- 邀请码/二维码

**好友状态**
- pending：待确认
- accepted：已好友
- blocked：已拉黑

**好友列表**
- 昵称/头像/关系标签
- 今日是否打卡、连续天数
- 操作：提醒、打气

### 6.2 打卡可见性与授权
**默认可见**
- 今日是否打卡
- 连续天数
- 最近一次打卡时间

**授权可见（可选）**
- 睡眠、精力、心情、备注
- 允许单向授权（A 授权 B，B 不一定授权 A）

**授权入口**
- 好友详情页
- 授权管理页（可撤回）

### 6.3 提醒与鼓励
**提醒**
- 每天对同一好友最多 1-2 次（配置项）
- 仅在对方未打卡时可发
- 用户可关闭“允许提醒”

**鼓励**
- 一键“👍 还在/💪 加油/🫶 一切都好”
- 可带一句话（可选）

### 6.4 群组（可选）
- 群内成员列表（仅状态+连续天数）
- 群内提醒（管理员或群主）
- 群内打卡完成率

### 6.5 附近（可选）
- 匿名展示，默认关闭
- 不显示手机号/精确位置
- 点赞鼓励，不允许私信

## 7. 关键交互（文字稿）
**好友列表**
- 卡片：头像+昵称+今日状态+连续天数
- CTA：提醒 / 打气

**好友详情**
- 顶部：今日状态+连续天数
- 详情区：有授权则展示睡眠/心情/备注，否则显示“未授权”
- 操作：申请授权 / 提醒 / 打气

**提醒**
- 点击“提醒”→ 弹窗确认 → 成功提示
- 若对方已打卡：按钮置灰

**授权**
- 好友请求授权 → 本人同意/拒绝 → 状态更新

## 8. 规则与限制
- 提醒频控：默认 1 次/天/好友
- 详情授权：单向、可撤回
- 附近功能：默认关闭，匿名显示
- 群组规模：默认 50 人（可配置）

## 9. 数据模型（表结构）
**users**
- id (PK)
- phone
- nickname
- avatar_url
- timezone
- created_at

**friendships**
- id (PK)
- user_id (FK)
- friend_id (FK)
- status (pending/accepted/blocked)
- created_at

**friend_settings**
- id (PK)
- user_id
- friend_id
- can_view_detail (bool)
- can_remind (bool)
- created_at

**reminders**
- id (PK)
- from_user_id
- to_user_id
- date
- created_at

**encouragements**
- id (PK)
- from_user_id
- to_user_id
- checkin_date
- emoji
- message
- created_at

**groups**（可选）
- id (PK)
- name
- owner_id
- created_at

**group_members**（可选）
- id (PK)
- group_id
- user_id
- role (owner/admin/member)
- created_at

**nearby_checkins**（可选）
- id (PK)
- user_id
- lat
- lng
- date
- visible (bool)
- created_at

## 10. 接口设计（REST 草案）
**好友**
- `POST /friends/request` 发起好友请求
- `POST /friends/accept` 接受请求
- `GET /friends` 好友列表
- `GET /friends/{id}` 好友详情
- `POST /friends/{id}/block` 拉黑

**授权**
- `POST /friends/{id}/permission` 设置授权
- `GET /friends/{id}/permission` 获取授权状态

**提醒与鼓励**
- `POST /friends/{id}/remind` 发送提醒
- `POST /friends/{id}/encourage` 发送鼓励
- `GET /encouragements?date=` 获取鼓励列表

**群组**
- `POST /groups` 创建群组
- `POST /groups/{id}/join` 加入群组
- `GET /groups/{id}` 群详情
- `POST /groups/{id}/remind` 群提醒

**附近**
- `GET /nearby/checkins` 附近打卡列表
- `POST /nearby/optin` 开启附近展示
- `POST /nearby/optout` 关闭附近展示

## 11. 统计与埋点
- 好友添加完成率
- 提醒发送次数/触达率
- 打气互动次数
- 授权同意率
- 连续天数变化

## 12. 风险与应对
- 隐私泄露：默认不展示详情 + 授权控制
- 过度打扰：提醒频控 + 允许关闭提醒
- 陌生人骚扰：附近匿名、无私信

## 13. 里程碑
- V1：好友+提醒+鼓励+授权
- V2：群组+勋章
- V3：附近与动态流
