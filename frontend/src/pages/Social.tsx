import { useEffect, useMemo, useRef, useState } from "react";
import {
  Friend,
  FriendDetail,
  FriendPermission,
  Notification,
  acceptFriend,
  encourageFriend,
  getFriendDetail,
  getFriends,
  getNotifications,
  remindFriend,
  markAllNotificationsRead,
  markNotificationRead,
  requestFriend,
  updateFriendPermission
} from "../services/api";

const encourageOptions = [
  { label: "加油", emoji: "💪" },
  { label: "支持", emoji: "👍" },
  { label: "在想你", emoji: "🫶" }
];

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status: string) {
  if (status === "pending_in") return "待确认";
  if (status === "pending_out") return "已发送";
  if (status === "accepted") return "好友";
  return "未知";
}

export default function Social() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [details, setDetails] = useState<Record<number, FriendDetail>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [encourageChoice, setEncourageChoice] = useState(encourageOptions[0].emoji);
  const [form, setForm] = useState({ phone: "", message: "" });
  const [addOpen, setAddOpen] = useState(false);
  const messageLimit = 20;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);
  const [openNoticeGroups, setOpenNoticeGroups] = useState<Record<string, boolean>>({});

  const groupedNotifications = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        items: Notification[];
        latest: Notification;
        unreadCount: number;
        name: string;
        avatar?: string | null;
      }
    >();

    notifications.forEach((item) => {
      const key = item.from_user_id ? `user-${item.from_user_id}` : `notice-${item.id}`;
      const name = item.from_user_name || "好友";
      const avatar = item.from_user_avatar ?? null;
      if (!groups.has(key)) {
        groups.set(key, { key, items: [item], latest: item, unreadCount: 0, name, avatar });
      } else {
        groups.get(key)?.items.push(item);
      }
    });

    groups.forEach((group) => {
      group.items.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      group.latest = group.items[0];
      group.unreadCount = group.items.filter((item) => !item.read_at).length;
      group.name = group.latest.from_user_name || group.name;
      group.avatar = group.latest.from_user_avatar ?? group.avatar;
    });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime()
    );
  }, [notifications]);

  useEffect(() => {
    void refresh();
    void refreshNotifications();
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  function setNoticeWithAutoClear(message: string) {
    setNotice(message);
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, 2000);
  }

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await getFriends();
      setFriends(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function refreshNotifications() {
    setLoadingNotifications(true);
    try {
      const list = await getNotifications({ limit: 20 });
      setNotifications(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "通知加载失败");
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function handleReadNotification(notificationId: number) {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "标记失败");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
      );
      setNoticeWithAutoClear("全部已读");
    } catch (err) {
      setError(err instanceof Error ? err.message : "标记失败");
    }
  }

  function toggleNoticeGroup(key: string) {
    setOpenNoticeGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleRequest() {
    if (!form.phone.trim()) {
      setError("请输入手机号");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestFriend({
        phone: form.phone.trim(),
        message: form.message.trim() || undefined
      });
      setForm({ phone: "", message: "" });
      setAddOpen(false);
      setNoticeWithAutoClear("已发送好友请求");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(friendId: number) {
    setActionLoadingId(friendId);
    setError(null);
    try {
      await acceptFriend({ friend_id: friendId });
      setNoticeWithAutoClear("已通过好友请求");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleToggleDetail(friend: Friend) {
    if (selectedId === friend.id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(friend.id);
    if (!details[friend.id]) {
      try {
        const detail = await getFriendDetail(friend.id);
        setDetails((prev) => ({ ...prev, [friend.id]: detail }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      }
    }
  }

  async function handlePermissionUpdate(friendId: number, payload: FriendPermission) {
    setActionLoadingId(friendId);
    setError(null);
    try {
      const updated = await updateFriendPermission(friendId, payload);
      setDetails((prev) => {
        const existing = prev[friendId];
        if (!existing) return prev;
        return { ...prev, [friendId]: { ...existing, permission: updated } };
      });
      setNoticeWithAutoClear("权限已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRemind(friendId: number) {
    setActionLoadingId(friendId);
    setError(null);
    try {
      const res = await remindFriend(friendId);
      if (res.limited) {
        setNoticeWithAutoClear("今天已提醒过了");
      } else {
        setNoticeWithAutoClear("提醒已发送");
      }
      void refreshNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "提醒失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleEncourage(friendId: number) {
    setActionLoadingId(friendId);
    setError(null);
    try {
      await encourageFriend(friendId, { emoji: encourageChoice });
      setNoticeWithAutoClear("鼓励已发送");
      void refreshNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="page page-social">
      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <div className="form-header header-row friend-list-header">
          <div>
            <h2>好友列表</h2>
            <p>查看好友的打卡状态并互相鼓励</p>
          </div>
          <div className="notice-actions">
            <button
              className="secondary add-friend-trigger"
              type="button"
              onClick={() => setAddOpen(true)}
            >
              <span className="add-friend-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              添加好友
            </button>
            <button className="secondary" type="button" onClick={refresh}>
              刷新
            </button>
          </div>
        </div>

        {loading ? (
          <p className="muted">加载中...</p>
        ) : friends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true" />
            <p>还没有好友</p>
            <span>先邀请一位朋友一起打卡吧</span>
          </div>
        ) : (
          <div className="friend-list">
            {friends.map((friend) => {
              const detail = details[friend.id];
              const isExpanded = selectedId === friend.id;
              return (
                <div key={friend.id} className="friend-item">
                  <button
                    type="button"
                    className="friend-card"
                    onClick={() => handleToggleDetail(friend)}
                  >
                    <div className="friend-main">
                      <div className="friend-avatar">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt={friend.nickname || "好友头像"} />
                        ) : (
                          <span className="friend-avatar-fallback" aria-hidden="true" />
                        )}
                      </div>
                      <div className="friend-info">
                        <div className="friend-name-row">
                          <div className="friend-name">{friend.nickname || "未设置昵称"}</div>
                          <span className="status-pill">{statusLabel(friend.status)}</span>
                        </div>
                        <div className="friend-meta">
                          <span>{friend.today_checked_in ? "今日已打卡" : "今日未打卡"}</span>
                          <span>连续 {friend.streak_days} 天</span>
                        </div>
                        {friend.status === "pending_in" && friend.message ? (
                          <div className="friend-message">留言：{friend.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <span className="friend-toggle">{isExpanded ? "收起" : "查看"}</span>
                  </button>

                  {isExpanded ? (
                    <div className="friend-detail">
                      <div className="detail-row">
                        <span>手机号</span>
                        <strong>{detail?.phone ?? "-"}</strong>
                      </div>
                      <div className="detail-row">
                        <span>最近打卡</span>
                        <strong>{detail?.last_checkin_at ? "已记录" : "暂无"}</strong>
                      </div>
                      {detail ? (
                        <div className="permission-grid">
                          <label className="toggle-row">
                            允许查看详情
                            <input
                              type="checkbox"
                              className="toggle"
                              checked={detail.permission.can_view_detail}
                              disabled={actionLoadingId === friend.id}
                              onChange={(event) =>
                                handlePermissionUpdate(friend.id, {
                                  ...detail.permission,
                                  can_view_detail: event.target.checked
                                })
                              }
                            />
                          </label>
                          <label className="toggle-row">
                            允许提醒
                            <input
                              type="checkbox"
                              className="toggle"
                              checked={detail.permission.can_remind}
                              disabled={actionLoadingId === friend.id}
                              onChange={(event) =>
                                handlePermissionUpdate(friend.id, {
                                  ...detail.permission,
                                  can_remind: event.target.checked
                                })
                              }
                            />
                          </label>
                        </div>
                      ) : (
                        <span className="muted">正在加载详情...</span>
                      )}

                      <div className="friend-actions">
                        {friend.status === "pending_in" ? (
                          <button
                            className="primary"
                            type="button"
                            disabled={actionLoadingId === friend.id}
                            onClick={() => handleAccept(friend.id)}
                          >
                            通过好友
                          </button>
                        ) : friend.status === "pending_out" ? (
                          <span className="muted">等待对方确认</span>
                        ) : (
                          <>
                            <button
                              className="secondary"
                              type="button"
                              disabled={
                                actionLoadingId === friend.id ||
                                (detail ? !detail.permission.can_remind : false)
                              }
                              onClick={() => handleRemind(friend.id)}
                            >
                              提醒打卡
                            </button>
                            <div className="encourage-group">
                              <select
                                value={encourageChoice}
                                onChange={(event) => setEncourageChoice(event.target.value)}
                                className="encourage-select"
                                name="encourage_choice"
                              >
                                {encourageOptions.map((option) => (
                                  <option key={option.emoji} value={option.emoji}>
                                    {option.emoji} {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="secondary"
                                type="button"
                                disabled={actionLoadingId === friend.id}
                                onClick={() => handleEncourage(friend.id)}
                              >
                                发送鼓励
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <div className="form-header header-row notice-header">
          <div>
            <h2>站内通知</h2>
            <p>提醒与鼓励会显示在这里</p>
          </div>
          <div className="notice-actions">
            <button
              className={`secondary ${
                notifications.some((item) => !item.read_at) ? "" : "secondary-muted"
              }`}
              type="button"
              onClick={handleMarkAllRead}
              disabled={!notifications.some((item) => !item.read_at)}
            >
              {notifications.some((item) => !item.read_at) ? "全部已读" : "暂无未读"}
            </button>
            <button className="secondary" type="button" onClick={refreshNotifications}>
              刷新
            </button>
          </div>
        </div>
        {loadingNotifications ? (
          <p className="muted">加载中...</p>
        ) : groupedNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true" />
            <p>暂无通知</p>
            <span>好友提醒或鼓励会显示在这里</span>
          </div>
        ) : (
          <div className="notice-list">
            {groupedNotifications.map((group) => {
              const isOpen = openNoticeGroups[group.key];
              return (
                <div
                  key={group.key}
                  className={`notice-group ${group.unreadCount ? "unread" : ""}`}
                >
                  <button
                    className="notice-group-header"
                    type="button"
                    onClick={() => toggleNoticeGroup(group.key)}
                  >
                    <div className="notice-left">
                      <div className="friend-avatar notice-avatar">
                        {group.avatar ? (
                          <img src={group.avatar} alt={group.name} />
                        ) : (
                          <span className="friend-avatar-fallback" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <div className="notice-title">
                          <span className="notice-name">{group.name}</span>
                          <span className={`notice-type ${group.latest.kind}`}>
                            {group.latest.kind === "remind" ? "提醒" : "鼓励"}
                          </span>
                          <span className="notice-time">
                            {formatTime(group.latest.created_at)}
                          </span>
                        </div>
                        <div className="notice-message">{group.latest.message}</div>
                      </div>
                    </div>
                    <span className="notice-mark" aria-hidden="true">
                      {group.unreadCount ? (
                        <>
                          <span className="notice-dot" />
                          <span className="notice-badge notice-count">
                            未读 {group.unreadCount}
                          </span>
                        </>
                      ) : null}
                      <span className={`notice-chevron ${isOpen ? "open" : ""}`}>›</span>
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="notice-group-body">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          className={`notice-row sub ${item.read_at ? "" : "unread"}`}
                          type="button"
                          onClick={() => handleReadNotification(item.id)}
                        >
                          <div className="notice-left">
                            <div className="notice-title">
                              <span className={`notice-type ${item.kind}`}>
                                {item.kind === "remind" ? "提醒" : "鼓励"}
                              </span>
                              <span className="notice-time">
                                {formatTime(item.created_at)}
                              </span>
                            </div>
                            <div className="notice-message">{item.message}</div>
                          </div>
                          {!item.read_at ? (
                            <span className="notice-dot" aria-hidden="true" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div
        className={`sheet-overlay ${addOpen ? "show" : ""}`}
        onClick={() => setAddOpen(false)}
      />
      <div className={`sheet ${addOpen ? "show" : ""}`} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>添加好友</h3>
          <button className="link" type="button" onClick={() => setAddOpen(false)}>
            关闭
          </button>
        </div>
        <div className="sheet-section">
          <div className="social-form">
            <label>
              手机号
              <input
                type="tel"
                placeholder="输入对方手机号"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                name="friend_phone"
                required
              />
            </label>
            <label className="span-2">
              留言
              <input
                type="text"
                placeholder="给对方说一句话"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                name="friend_message"
                maxLength={messageLimit}
              />
              <span className="char-remaining">剩余 {messageLimit - form.message.length} 字</span>
            </label>
            <button
              className="primary span-2"
              type="button"
              onClick={handleRequest}
              disabled={submitting}
            >
              {submitting ? "发送中..." : "发送好友请求"}
            </button>
          </div>
        </div>
      </div>

      {notice ? <div className="toast">{notice}</div> : null}
    </div>
  );
}
