import { useEffect, useMemo, useRef, useState } from "react";
import {
  Friend,
  FriendDetail,
  FriendPermission,
  GroupDetail,
  GroupEncouragePost,
  GroupSummary,
  Notification,
  acceptFriend,
  encourageFriend,
  getMe,
  getFriendDetail,
  getFriends,
  getNotifications,
  remindFriend,
  markAllNotificationsRead,
  markNotificationRead,
  requestFriend,
  updateFriendPermission,
  createGroup,
  approveGroupMember,
  getGroupDetail,
  getGroupEncouragements,
  getGroups,
  joinGroup,
  rejectGroupMember,
  rotateGroupInviteCode,
  sendGroupEncouragement,
  sendGroupReminder,
  updateGroupAnnouncement,
  updateGroupName
} from "../services/api";

const encourageOptions = [
  { label: "加油", emoji: "💪" },
  { label: "支持", emoji: "👍" },
  { label: "在想你", emoji: "🫶" }
];

const groupEncourageOptions = [
  { label: "加油", emoji: "💪" },
  { label: "冲鸭", emoji: "🚀" },
  { label: "挺你", emoji: "👏" }
];


function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function noticeKindLabel(kind: string) {
  if (kind === "remind") return "提醒";
  if (kind === "encourage") return "鼓励";
  if (kind === "group_join_request") return "入群申请";
  if (kind === "group_join_approved") return "已通过";
  if (kind === "group_join_rejected") return "已拒绝";
  if (kind === "group_joined") return "已加入";
  return "通知";
}

function resolveJoinRequestStatus(item: Notification) {
  if (item.kind === "group_join_approved") return "approved";
  if (item.kind === "group_join_rejected") return "rejected";
  if (item.message.includes("已通过")) return "approved";
  if (item.message.includes("已拒绝") || item.message.includes("拒绝")) return "rejected";
  if (item.message.includes("已加入")) return "approved";
  if (item.read_at) return "expired";
  return "pending";
}

function formatJoinRequestStatus(item: Notification) {
  const status = resolveJoinRequestStatus(item);
  const name = item.related_user_name || item.from_user_name || "对方";
  const applicantSide =
    item.message.includes("你已加入") ||
    item.message.includes("已被拒绝") ||
    item.message.includes("你的入群申请");
  if (status === "approved") {
    return applicantSide ? "你的入群申请已通过" : `已通过 ${name} 的入群申请`;
  }
  if (status === "rejected") {
    return applicantSide ? "你的入群申请已被拒绝" : `已拒绝 ${name} 的入群申请`;
  }
  return applicantSide ? "你的入群申请已过期" : `${name} 的入群申请已过期`;
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
  const [groupPanelOpen, setGroupPanelOpen] = useState(false);
  const [groupDetailOpen, setGroupDetailOpen] = useState(false);
  const [groupEncourageOpen, setGroupEncourageOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupEncourageChoice, setGroupEncourageChoice] = useState(
    groupEncourageOptions[0].emoji
  );
  const [groupForm, setGroupForm] = useState({
    name: "",
    code: "",
    privacy: "public" as "public" | "private",
    requiresApproval: true
  });
  const [groupInviteDraft, setGroupInviteDraft] = useState("");
  const [groupJoinRequests, setGroupJoinRequests] = useState<Record<number, number>>({});
  const [groupEncourageWall, setGroupEncourageWall] = useState<GroupEncouragePost[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);

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
      const key = item.related_group_id
        ? `group-${item.related_group_id}`
        : item.from_user_id
        ? `user-${item.from_user_id}`
        : `notice-${item.id}`;
      const name = item.related_group_id
        ? item.related_group_name || "群通知"
        : item.from_user_name || "好友";
      const avatar = item.related_group_id ? null : item.from_user_avatar ?? null;
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
      if (group.latest.related_group_id) {
        group.name = group.latest.related_group_name || group.name;
        group.avatar = group.avatar ?? null;
      } else {
        group.name = group.latest.from_user_name || group.name;
        group.avatar = group.latest.from_user_avatar ?? group.avatar;
      }
    });

    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime()
    );
  }, [notifications]);

  const groupJoinCooldown = useMemo(() => {
    if (!selectedGroup) return null;
    const last = groupJoinRequests[selectedGroup.id];
    if (!last) return null;
    const remainingMs = 24 * 60 * 60 * 1000 - (Date.now() - last);
    return remainingMs > 0 ? remainingMs : null;
  }, [groupJoinRequests, selectedGroup]);

  useEffect(() => {
    void refresh();
    void refreshGroups();
    void refreshNotifications();
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setCurrentUserId(me.id);
      } catch {
        setCurrentUserId(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (groupedNotifications.length === 0) {
      return;
    }
    setOpenNoticeGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      groupedNotifications.forEach((group) => {
        if (next[group.key] === undefined) {
          next[group.key] = group.unreadCount > 0;
          changed = true;
        }
      });
      Object.keys(next).forEach((key) => {
        if (!groupedNotifications.find((group) => group.key === key)) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [groupedNotifications]);

  useEffect(() => {
    if (!selectedGroup) {
      setAnnouncementDraft("");
      setIsEditingAnnouncement(false);
      setGroupInviteDraft("");
      setGroupNameDraft("");
      setIsEditingGroupName(false);
      return;
    }
    setAnnouncementDraft(selectedGroup.announcement ?? "");
    setIsEditingAnnouncement(false);
    setGroupInviteDraft("");
    setGroupNameDraft(selectedGroup.name);
    setIsEditingGroupName(false);
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroupId === null) {
      setSelectedGroup(null);
      setGroupEncourageWall([]);
      return;
    }
    setGroupEncourageWall([]);
    (async () => {
      try {
        const detail = await getGroupDetail(selectedGroupId);
        setSelectedGroup(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "群组详情加载失败");
      }
    })();
  }, [selectedGroupId]);

  useEffect(() => {
    if (!groupEncourageOpen || selectedGroupId === null) return;
    (async () => {
      try {
        const posts = await getGroupEncouragements(selectedGroupId);
        setGroupEncourageWall(posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "鼓励墙加载失败");
      }
    })();
  }, [groupEncourageOpen, selectedGroupId]);

  useEffect(() => {
    if (!error) return;
    setNoticeWithAutoClear(error);
    setError(null);
  }, [error]);

  useEffect(() => {
    const shouldLock = groupEncourageOpen || groupDetailOpen || groupPanelOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    document.body.classList.toggle("group-encourage-open", groupEncourageOpen);
    document.body.classList.toggle("group-detail-open", groupDetailOpen);
    document.body.classList.toggle("group-panel-open", groupPanelOpen);
    document.documentElement.classList.toggle("group-detail-open", groupDetailOpen);
    document.documentElement.classList.toggle("group-panel-open", groupPanelOpen);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("group-encourage-open");
      document.body.classList.remove("group-detail-open");
      document.body.classList.remove("group-panel-open");
      document.documentElement.classList.remove("group-detail-open");
      document.documentElement.classList.remove("group-panel-open");
    };
  }, [groupEncourageOpen, groupDetailOpen, groupPanelOpen]);

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

  async function refreshGroups() {
    try {
      const list = await getGroups();
      setGroups(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "群组加载失败");
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

  async function handleApproveJoinRequest(notification: Notification) {
    if (!notification.related_group_id || !notification.related_user_id) return;
    try {
      await approveGroupMember(notification.related_group_id, notification.related_user_id);
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                kind: "group_join_approved",
                message: "已通过该入群申请",
                read_at: item.read_at || new Date().toISOString()
              }
            : item
        )
      );
      void refreshGroups();
      setNoticeWithAutoClear("已通过申请");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  async function handleRejectJoinRequest(notification: Notification) {
    if (!notification.related_group_id || !notification.related_user_id) return;
    try {
      await rejectGroupMember(notification.related_group_id, notification.related_user_id);
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                kind: "group_join_rejected",
                message: "已拒绝该入群申请",
                read_at: item.read_at || new Date().toISOString()
              }
            : item
        )
      );
      void refreshGroups();
      setNoticeWithAutoClear("已拒绝申请");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
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

  function isGroupMember(group: { status: string }) {
    return group.status === "member";
  }

  function isGroupAdmin(group: GroupDetail) {
    if (!currentUserId) return false;
    return group.members.some(
      (member) =>
        member.id === currentUserId && (member.role === "owner" || member.role === "admin")
    );
  }

  function openGroupDetail(groupId: number) {
    setSelectedGroupId(groupId);
    setGroupDetailOpen(true);
  }

  function openGroupEncourage(groupId: number) {
    setSelectedGroupId(groupId);
    setGroupEncourageOpen(true);
    setGroupDetailOpen(false);
  }

  async function handleCreateGroup() {
    if (!groupForm.name.trim()) {
      setError("请输入群组名称");
      return;
    }
    try {
      const detail = await createGroup({
        name: groupForm.name.trim(),
        privacy: groupForm.privacy,
        requires_approval: groupForm.requiresApproval
      });
      setGroupForm({ name: "", code: "", privacy: "public", requiresApproval: true });
      setGroupPanelOpen(false);
      setSelectedGroup(detail);
      setSelectedGroupId(detail.id);
      await refreshGroups();
      openGroupDetail(detail.id);
      setNoticeWithAutoClear("群组已创建");
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建群组失败");
    }
  }

  async function handleJoinGroup() {
    if (!groupForm.code.trim()) {
      setError("请输入邀请码或群 ID");
      return;
    }
    await performJoin(groupForm.code.trim());
    setGroupForm((prev) => ({ ...prev, code: "" }));
    setGroupPanelOpen(false);
  }

  async function performJoin(codeOrId: string) {
    try {
      const detail = await joinGroup({ code_or_id: codeOrId });
      setSelectedGroup(detail);
      setSelectedGroupId(detail.id);
      await refreshGroups();
      if (detail.status === "member") {
        openGroupEncourage(detail.id);
        setNoticeWithAutoClear("已加入群组");
      } else {
        setGroupJoinRequests((prev) => ({ ...prev, [detail.id]: Date.now() }));
        openGroupDetail(detail.id);
        setNoticeWithAutoClear("已提交入群申请");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加入失败";
      if (message.includes("24 小时") || message.includes("24小时")) {
        setNoticeWithAutoClear(message);
        return;
      }
      setError(message);
    }
  }

  async function handleUpdateAnnouncement() {
    if (!selectedGroup || !isGroupAdmin(selectedGroup)) return;
    try {
      const updated = await updateGroupAnnouncement(
        selectedGroup.id,
        announcementDraft.trim() || selectedGroup.announcement || ""
      );
      setSelectedGroup(updated);
      setIsEditingAnnouncement(false);
      setNoticeWithAutoClear("公告已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    }
  }

  async function handleUpdateGroupName() {
    if (!selectedGroup || !isGroupAdmin(selectedGroup)) return;
    if (!groupNameDraft.trim()) {
      setError("群名称不能为空");
      return;
    }
    try {
      const updated = await updateGroupName(selectedGroup.id, groupNameDraft.trim());
      setSelectedGroup(updated);
      await refreshGroups();
      setIsEditingGroupName(false);
      setNoticeWithAutoClear("群名称已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    }
  }

  async function handleRotateInviteCode() {
    if (!selectedGroup || !isGroupAdmin(selectedGroup)) return;
    try {
      const updated = await rotateGroupInviteCode(selectedGroup.id);
      setSelectedGroup(updated);
      setNoticeWithAutoClear("邀请码已刷新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    }
  }

  async function handleCopy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNoticeWithAutoClear(message);
    } catch {
      setNoticeWithAutoClear("复制失败，请手动复制");
    }
  }

  async function handleGroupRemind() {
    if (!selectedGroup) return;
    try {
      await sendGroupReminder(selectedGroup.id);
      setNoticeWithAutoClear("群提醒已发送");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    }
  }

  async function handleGroupEncourage() {
    if (!selectedGroup) return;
    try {
      await sendGroupEncouragement(selectedGroup.id, {
        emoji: groupEncourageChoice
      });
      setNoticeWithAutoClear(`群鼓励已发送 ${groupEncourageChoice}`);
      const posts = await getGroupEncouragements(selectedGroup.id);
      setGroupEncourageWall(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    }
  }

  async function handlePrivateInviteJoin(group: GroupDetail) {
    const code = groupInviteDraft.trim();
    if (!code) {
      setError("请输入邀请码");
      return;
    }
    await performJoin(code);
    setGroupInviteDraft("");
  }

  if (groupEncourageOpen) {
    return (
      <div className="group-encourage-panel">
        <div className="group-encourage-toolbar">
          <button className="link" type="button" onClick={() => setGroupEncourageOpen(false)}>
            返回
          </button>
          <h3>群鼓励</h3>
          {selectedGroup ? (
            <button
              className="link"
              type="button"
              onClick={() => {
                setGroupEncourageOpen(false);
                setGroupDetailOpen(true);
              }}
            >
              群详情
            </button>
          ) : null}
        </div>
        <div className="group-encourage-content">
          <div className="group-encourage-page">
            {selectedGroup ? (
              <>
                <div className="group-encourage-header">
                  <div>
                    <h4>{selectedGroup.name}</h4>
                    <p>
                      今日活跃{" "}
                      {selectedGroup.members.filter((member) => member.checked_in).length} /
                      {selectedGroup.members.length}
                    </p>
                  </div>
                  <button className="secondary" type="button">
                    @提醒
                  </button>
                </div>
                <div className="group-encourage-grid">
                  <div className="group-encourage-card">
                    <h5>群内鼓励墙</h5>
                    <div className="encourage-wall">
                      {groupEncourageWall.map((post) => (
                        <div key={post.id} className="encourage-post">
                          <strong>{post.author}</strong>
                          <span>{post.message}</span>
                          <em>{formatTime(post.created_at)}</em>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="group-encourage-card">
                    <h5>今日排行榜</h5>
                    <ol className="group-rank">
                      {selectedGroup.members.slice(0, 5).map((member, index) => (
                        <li key={member.id}>
                          <span>{index + 1}</span>
                          <div>
                            <strong>{member.name}</strong>
                            <em>{member.checked_in ? "已打卡" : "未打卡"}</em>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="group-encourage-card">
                  <h5>发送群鼓励</h5>
                  <div className="group-encourage-actions">
                    <select
                      value={groupEncourageChoice}
                      onChange={(event) => setGroupEncourageChoice(event.target.value)}
                      className="encourage-select"
                      name="group_encourage_choice"
                    >
                      {groupEncourageOptions.map((option) => (
                        <option key={option.emoji} value={option.emoji}>
                          {option.emoji} {option.label}
                        </option>
                      ))}
                    </select>
                    <button className="primary" type="button" onClick={handleGroupEncourage}>
                      发送鼓励
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="muted">暂无群组信息</p>
            )}
          </div>
        </div>
        {notice ? <div className="toast">{notice}</div> : null}
      </div>
    );
  }

  return (
    <div className="page page-social">
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
        <div className="form-header header-row friend-list-header">
          <div>
            <h2>群组</h2>
            <p>加入群组一起监督打卡</p>
          </div>
          <div className="notice-actions">
            <button
              className="secondary add-friend-trigger"
              type="button"
              onClick={() => setGroupPanelOpen(true)}
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
              创建/加入
            </button>
          </div>
        </div>
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true" />
            <p>还没有群组</p>
            <span>可以创建或加入一个群组</span>
          </div>
        ) : (
          <div className="group-list">
            {groups.map((group) => (
              <button
                key={group.id}
                className="group-card"
                type="button"
                onClick={() =>
                  isGroupMember(group) ? openGroupEncourage(group.id) : openGroupDetail(group.id)
                }
              >
                <div className="group-avatar" aria-hidden="true">
                  <span className="group-avatar-mark" />
                </div>
                <div className="group-info">
                  <div className="group-name">
                    {group.name}
                    {group.privacy === "private" ? (
                      <span className="group-badge private">私密</span>
                    ) : null}
                    {isGroupMember(group) && group.unread_count ? (
                      <span className="group-badge">未读 {group.unread_count}</span>
                    ) : null}
                  </div>
                  <div className="group-meta">
                    <span>{group.members_count} 人</span>
                    <span>今日活跃 {group.active_today}</span>
                  </div>
                </div>
                <span className="group-chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
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
            <p>暂无通知</p>
            <span>好友提醒或鼓励会显示在这里</span>
          </div>
        ) : (
          <div className="notice-list">
            {groupedNotifications.map((group) => {
              const isOpen = openNoticeGroups[group.key];
              const isGroupNotice = Boolean(group.latest.related_group_id);
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
                      <div className={`friend-avatar notice-avatar ${isGroupNotice ? "group" : ""}`}>
                        {isGroupNotice ? (
                          <span className="notice-group-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" role="img" focusable="false">
                              <circle cx="9" cy="9" r="3" fill="currentColor" />
                              <circle cx="16" cy="10" r="2.5" fill="currentColor" />
                              <path
                                d="M4 19c0-3 3-5 7-5s7 2 7 5"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                fill="none"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        ) : group.avatar ? (
                          <img src={group.avatar} alt={group.name} />
                        ) : (
                          <span className="friend-avatar-fallback" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <div className="notice-title">
                          <span className="notice-name">{group.name}</span>
                          <span className={`notice-type ${group.latest.kind}`}>
                            {noticeKindLabel(group.latest.kind)}
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
                        <div
                          key={item.id}
                          className={`notice-row sub ${item.read_at ? "" : "unread"}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleReadNotification(item.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleReadNotification(item.id);
                            }
                          }}
                        >
                          <div className="notice-left">
                            <div className="notice-title">
                              <span className={`notice-type ${item.kind}`}>
                                {noticeKindLabel(item.kind)}
                              </span>
                              <span className="notice-time">
                                {formatTime(item.created_at)}
                              </span>
                            </div>
                            {item.kind.startsWith("group_join") &&
                            resolveJoinRequestStatus(item) !== "pending" ? null : (
                              <div className="notice-message">{item.message}</div>
                            )}
                            {item.kind.startsWith("group_join") ? (
                              resolveJoinRequestStatus(item) === "pending" ? (
                                <div className="notice-action-row">
                                  <button
                                    className="secondary"
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleApproveJoinRequest(item);
                                    }}
                                  >
                                    通过
                                  </button>
                                  <button
                                    className="secondary"
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleRejectJoinRequest(item);
                                    }}
                                  >
                                    拒绝
                                  </button>
                                </div>
                              ) : (
                                <div className="notice-action-row muted">
                                  {formatJoinRequestStatus(item)}
                                </div>
                              )
                            ) : null}
                          </div>
                          {!item.read_at ? (
                            <span className="notice-dot" aria-hidden="true" />
                          ) : null}
                        </div>
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

      <div
        className={`sheet-overlay ${groupPanelOpen ? "show" : ""}`}
        onClick={() => setGroupPanelOpen(false)}
      />
      <div
        className={`sheet ${groupPanelOpen ? "show" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>群组</h3>
          <button className="link" type="button" onClick={() => setGroupPanelOpen(false)}>
            关闭
          </button>
        </div>
        <div className="sheet-section">
          <div className="group-panel">
            <div className="group-panel-card">
              <div className="group-panel-title">加入群组</div>
              <div className="group-join">
                <label>
                  邀请码/群 ID
                  <input
                    type="text"
                    placeholder="输入群组邀请码或群 ID"
                    name="group_code"
                    value={groupForm.code}
                    onChange={(event) => setGroupForm({ ...groupForm, code: event.target.value })}
                  />
                </label>
                <button className="primary" type="button" onClick={handleJoinGroup}>
                  申请加入
                </button>
              </div>
              <p className="muted">公开群可能需要审核，私密群仅支持邀请码加入。</p>
            </div>
            <div className="group-panel-card">
              <div className="group-panel-title">创建群组</div>
              <div className="group-create">
                <label>
                  群组名称
                  <input
                    type="text"
                    placeholder="给群组取个名字"
                    name="group_name"
                    value={groupForm.name}
                    onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })}
                  />
                </label>
                <div className="group-create-controls">
                  <label className="toggle-row">
                    <span>隐私群</span>
                    <input
                      type="checkbox"
                      className="toggle"
                      checked={groupForm.privacy === "private"}
                      onChange={(event) =>
                        setGroupForm({
                          ...groupForm,
                          privacy: event.target.checked ? "private" : "public"
                        })
                      }
                    />
                  </label>
                  <label className="toggle-row">
                    <span>入群需审核</span>
                    <input
                      type="checkbox"
                      className="toggle"
                      checked={groupForm.requiresApproval}
                      onChange={(event) =>
                        setGroupForm({ ...groupForm, requiresApproval: event.target.checked })
                      }
                    />
                  </label>
                </div>
                <button
                  className="primary group-create-button"
                  type="button"
                  onClick={handleCreateGroup}
                >
                  创建群组
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`sheet-overlay ${groupDetailOpen ? "show" : ""}`}
        onClick={() => {
          setGroupDetailOpen(false);
          setSelectedGroupId(null);
        }}
      />
      <div
        className={`sheet ${groupDetailOpen ? "show" : ""} ${
          selectedGroup?.privacy === "private" ? "group-detail-fixed" : ""
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>群组详情</h3>
          <button
            className="link"
            type="button"
            onClick={() => {
              setGroupDetailOpen(false);
              setSelectedGroupId(null);
            }}
          >
            关闭
          </button>
        </div>
        {selectedGroup ? (
          <div className="sheet-section group-detail">
            <div className="group-detail-header">
              <div className="group-avatar large" aria-hidden="true">
                <span className="group-avatar-mark" />
              </div>
              <div>
                <div className="group-title-row">
                  {isEditingGroupName ? (
                    <input
                      type="text"
                      value={groupNameDraft}
                      onChange={(event) => setGroupNameDraft(event.target.value)}
                      name="group_name_edit"
                    />
                  ) : (
                    <h4>{selectedGroup.name}</h4>
                  )}
                  {isGroupAdmin(selectedGroup) ? (
                    <button
                      className="link"
                      type="button"
                      onClick={() => {
                        if (isEditingGroupName) {
                          handleUpdateGroupName();
                        } else {
                          setIsEditingGroupName(true);
                        }
                      }}
                    >
                      {isEditingGroupName ? "保存" : "改名"}
                    </button>
                  ) : null}
                </div>
                <p>
                  {selectedGroup.members.length} 人 · 今日活跃{" "}
                  {selectedGroup.members.filter((member) => member.checked_in).length}
                </p>
              </div>
            </div>
            {isGroupMember(selectedGroup) ? (
              <div className="group-id-row">
                <span>群 ID：{selectedGroup.id}</span>
                <button
                  className="link"
                  type="button"
                  onClick={() => handleCopy(String(selectedGroup.id), "群 ID 已复制")}
                >
                  复制
                </button>
                {selectedGroup.privacy === "private" && selectedGroup.join_code ? (
                  <span className="group-invite">
                    邀请码：{selectedGroup.join_code}
                    <button
                      className="link"
                      type="button"
                      onClick={() => handleCopy(selectedGroup.join_code || "", "邀请码已复制")}
                    >
                      复制
                    </button>
                    {isGroupAdmin(selectedGroup) ? (
                      <button className="link" type="button" onClick={handleRotateInviteCode}>
                        刷新
                      </button>
                    ) : null}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="group-detail-block">
              <div className="group-block-header">
                <h5>群公告</h5>
                {isGroupAdmin(selectedGroup) ? (
                  <button
                    className="link"
                    type="button"
                    onClick={() => setIsEditingAnnouncement((prev) => !prev)}
                  >
                    {isEditingAnnouncement ? "收起" : "编辑"}
                  </button>
                ) : null}
              </div>
              {selectedGroup.privacy === "private" && !isGroupMember(selectedGroup) ? (
                <p>私密群暂不展示公告内容</p>
              ) : isEditingAnnouncement && isGroupAdmin(selectedGroup) ? (
                <div className="group-edit">
                  <textarea
                    value={announcementDraft}
                    onChange={(event) => setAnnouncementDraft(event.target.value)}
                    rows={3}
                    name="group_announcement"
                  />
                  <div className="group-edit-actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        setAnnouncementDraft(selectedGroup.announcement);
                        setIsEditingAnnouncement(false);
                      }}
                    >
                      取消
                    </button>
                    <button className="primary" type="button" onClick={handleUpdateAnnouncement}>
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <p>{selectedGroup.announcement}</p>
              )}
            </div>
            <div className="group-detail-block">
              <div className="group-block-header">
                <h5>成员</h5>
                <span className="muted">仅展示前 12 位</span>
              </div>
              {selectedGroup.privacy === "private" && !isGroupMember(selectedGroup) ? (
                <p>私密群暂不展示成员信息</p>
              ) : (
                <div className="group-members">
                  {selectedGroup.members.slice(0, 12).map((member) => (
                    <div key={member.id} className="group-member">
                      <span className="group-member-avatar" aria-hidden="true" />
                      <span>
                        {member.name}
                        {member.role === "owner" ? " · 群主" : ""}
                        {member.role === "admin" ? " · 管理" : ""}
                      </span>
                      {member.checked_in ? <em>已打卡</em> : <em>未打卡</em>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="group-detail-block">
              <h5>操作</h5>
              {isGroupMember(selectedGroup) ? (
                <div className="group-detail-actions">
                  <button
                    className="primary"
                    type="button"
                    onClick={() => openGroupEncourage(selectedGroup.id)}
                  >
                    进入群鼓励
                  </button>
                  <button className="secondary" type="button" onClick={handleGroupRemind}>
                    群提醒
                  </button>
                </div>
              ) : (
                <div className="group-join-actions">
                  {selectedGroup.privacy === "public" && !selectedGroup.requires_approval ? (
                    <button
                      className="primary"
                      type="button"
                      onClick={() => performJoin(String(selectedGroup.id))}
                    >
                      直接加入群组
                    </button>
                  ) : selectedGroup.privacy === "public" ? (
                    <button
                      className="primary"
                      type="button"
                      onClick={() => performJoin(String(selectedGroup.id))}
                      disabled={Boolean(groupJoinCooldown)}
                    >
                      {groupJoinCooldown ? "已提交申请" : "申请加入"}
                    </button>
                  ) : (
                    <div className="group-inline-join">
                      <label>
                        邀请码
                        <input
                          type="text"
                          placeholder="输入邀请码"
                          name="group_invite"
                          value={groupInviteDraft}
                          onChange={(event) => setGroupInviteDraft(event.target.value)}
                        />
                      </label>
                      <button
                        className="primary"
                        type="button"
                        onClick={() => {
                          handlePrivateInviteJoin(selectedGroup);
                        }}
                        disabled={!groupInviteDraft.trim()}
                      >
                        加入群组
                      </button>
                    </div>
                  )}
                  <p className="muted">
                    {selectedGroup.privacy === "public"
                      ? selectedGroup.requires_approval
                        ? "该群为公开群，加入需审核"
                        : "该群为公开群，无需审核"
                      : "该群为隐私群，输入邀请码可直接加入"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {notice ? <div className="toast">{notice}</div> : null}
    </div>
  );
}
