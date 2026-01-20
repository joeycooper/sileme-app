export type CheckinPayload = {
  alive: boolean;
  sleep_hours?: number | null;
  energy?: number | null;
  mood?: number | null;
  note?: string | null;
};

export type Checkin = CheckinPayload & {
  id: number;
  date: string;
};

export type Stats = {
  streak_days: number;
  checkin_rate: number;
  avg_sleep_hours: number;
  total_days: number;
  checkins: number;
  window_days: number;
};

export type AuthUser = {
  id: number;
  phone: string;
  timezone: string;
  nickname?: string | null;
  avatar_url?: string | null;
  wechat?: string | null;
  email?: string | null;
  alarm_hours: number;
  estate_note?: string | null;
  last_checkin_at?: string | null;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  access_expires_in: number;
  refresh_expires_in: number;
  refresh_token_id: number;
};

export type LoginPayload = {
  phone: string;
  password: string;
  device_name?: string | null;
};

export type RegisterPayload = {
  phone: string;
  password: string;
  timezone: string;
  sms_code: string;
};

export type Device = {
  id: number;
  device_name: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
};

export type DailySummary = {
  date: string;
  checked_in: boolean;
  sleep_hours: number | null;
  energy: number | null;
  mood: number | null;
};

export type Summary = {
  days: number;
  checkins: number;
  checkin_rate: number;
  avg_sleep_hours: number;
  avg_energy: number;
  avg_mood: number;
  items: DailySummary[];
};

export type ProfileUpdate = {
  nickname?: string | null;
  avatar_url?: string | null;
  wechat?: string | null;
  email?: string | null;
  alarm_hours: number;
  estate_note?: string | null;
};

export type ContactIn = {
  name: string;
  relation: string;
  phone: string;
  wechat?: string | null;
  email?: string | null;
  note?: string | null;
  avatar_url?: string | null;
};

export type ContactsPayload = {
  primary: ContactIn;
  backups: ContactIn[];
};

export type ContactOut = ContactIn & {
  id: number;
  kind: string;
};

export type ContactsOut = {
  primary: ContactOut | null;
  backups: ContactOut[];
};

export type Friend = {
  id: number;
  nickname?: string | null;
  avatar_url?: string | null;
  status: string;
  today_checked_in: boolean;
  streak_days: number;
  message?: string | null;
};

export type FriendPermission = {
  can_view_detail: boolean;
  can_remind: boolean;
};

export type FriendDetail = Friend & {
  phone: string;
  last_checkin_at?: string | null;
  permission: FriendPermission;
};

export type FriendRequestPayload = {
  phone: string;
  message?: string | null;
};

export type FriendAcceptPayload = {
  friend_id: number;
};

export type EncouragePayload = {
  emoji: string;
  message?: string | null;
};

export type RemindResult = {
  sent: boolean;
  limited: boolean;
};

export type Notification = {
  id: number;
  kind: string;
  message: string;
  from_user_id: number | null;
  from_user_name?: string | null;
  from_user_avatar?: string | null;
  related_group_id?: number | null;
  related_group_name?: string | null;
  related_user_id?: number | null;
  related_user_name?: string | null;
  created_at: string;
  read_at?: string | null;
};

export type GroupSummary = {
  id: number;
  name: string;
  privacy: "public" | "private";
  requires_approval: boolean;
  members_count: number;
  active_today: number;
  unread_count: number;
  status: "member" | "pending" | "none";
};

export type GroupMember = {
  id: number;
  name: string;
  role: "owner" | "admin" | "member";
  checked_in: boolean;
};

export type GroupDetail = {
  id: number;
  name: string;
  privacy: "public" | "private";
  requires_approval: boolean;
  announcement?: string | null;
  status: "member" | "pending" | "none";
  members: GroupMember[];
  join_code?: string | null;
};

export type GroupCreatePayload = {
  name: string;
  privacy: "public" | "private";
  requires_approval: boolean;
};

export type GroupJoinPayload = {
  code_or_id: string;
};

export type GroupEncouragePayload = {
  emoji: string;
  message?: string | null;
};

export type GroupEncouragePost = {
  id: number;
  author: string;
  message: string;
  created_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const STORAGE_KEY = "sileme_auth";
const DEVICE_KEY = "sileme_device_id";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshTokenId: number | null = null;
let refreshPromise: Promise<boolean> | null = null;

function loadTokensFromStorage() {
  if (accessToken || refreshToken) return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as TokenPair;
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    refreshTokenId = data.refresh_token_id ?? null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveTokens(tokens: TokenPair) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  refreshTokenId = tokens.refresh_token_id;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  localStorage.setItem(DEVICE_KEY, String(tokens.refresh_token_id));
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  refreshTokenId = null;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DEVICE_KEY);
}

export function hasRefreshToken(): boolean {
  loadTokensFromStorage();
  return Boolean(refreshToken);
}

export function getCurrentDeviceId(): number | null {
  loadTokensFromStorage();
  if (refreshTokenId) return refreshTokenId;
  const stored = localStorage.getItem(DEVICE_KEY);
  return stored ? Number(stored) : null;
}

async function extractErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await res.json()) as { detail?: string | { msg?: string }[] };
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        return data.detail[0].msg;
      }
    } catch {
      // fall through to text parsing
    }
  }
  const text = await res.text();
  return text || res.statusText;
}

function toFriendlyMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid credentials")) return "手机号或密码不正确。";
  if (lower.includes("phone already registered")) return "这个手机号已注册，请直接登录。";
  if (lower.includes("invalid sms code")) return "验证码不正确，请重试。";
  if (lower.includes("user not found")) return "该手机号未注册，请先注册。";
  if (lower.includes("not authenticated")) return "请先登录再操作。";
  if (lower.includes("invalid token")) return "登录状态已失效，请重新登录。";
  if (lower.includes("refresh token")) return "登录已过期，请重新登录。";
  if (lower.includes("no check-in for today")) return "今天还没有打卡记录。";
  if (lower.includes("invalid timezone")) return "时区填写不正确，请检查后再试。";
  if (lower.includes("already friends")) return "已经是好友了。";
  if (lower.includes("cannot add yourself")) return "不能添加自己为好友。";
  if (lower.includes("blocked")) return "对方已将你拉黑或无法添加。";
  if (lower.includes("request not found")) return "请求不存在或已处理。";
  if (lower.includes("reminders disabled")) return "对方已关闭提醒。";
  if (lower.includes("group not found")) return "群组不存在。";
  if (lower.includes("invite code required")) return "该群需要邀请码。";
  if (lower.includes("apply cooldown")) return "申请已提交，请 24 小时后再试";
  if (lower.includes("not allowed")) return "没有权限执行该操作。";
  if (lower.includes("field required")) return "有必填项未填写，请检查。";
  if (lower.includes("string should match pattern")) return "手机号格式不正确。";
  if (lower.includes("string should have at least")) return "密码至少 8 位。";
  return "操作失败，请稍后再试。";
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const raw = await extractErrorMessage(res);
    throw new Error(toFriendlyMessage(raw));
  }
  return (await res.json()) as T;
}

async function requestRefresh(): Promise<boolean> {
  loadTokensFromStorage();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const data = await handleJson<TokenPair>(res);
    saveTokens(data);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function refreshTokensOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function apiFetch(input: RequestInfo, init: RequestInit = {}, retry = true) {
  loadTokensFromStorage();
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 && retry) {
    const refreshed = await refreshTokensOnce();
    if (refreshed) {
      return apiFetch(input, init, false);
    }
  }
  return res;
}

export async function authLogin(payload: LoginPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await handleJson<TokenPair>(res);
  saveTokens(data);
}

export async function authRegister(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  await handleJson<AuthUser>(res);
}

export async function requestSmsCode(phone: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/request-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  });
  await handleJson<{ status: string }>(res);
}

export async function getDevices(): Promise<Device[]> {
  const res = await apiFetch(`${API_BASE}/auth/devices`);
  return handleJson<Device[]>(res);
}

export async function logoutDevice(deviceId: number): Promise<void> {
  const res = await apiFetch(`${API_BASE}/auth/logout-device?device_id=${deviceId}`, {
    method: "POST"
  });
  await handleJson<{ status: string }>(res);
}

export async function authLogout(): Promise<void> {
  loadTokensFromStorage();
  if (refreshToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  }
  clearTokens();
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiFetch(`${API_BASE}/me`);
  return handleJson<AuthUser>(res);
}

export async function updateProfile(payload: ProfileUpdate): Promise<AuthUser> {
  const res = await apiFetch(`${API_BASE}/me/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<AuthUser>(res);
}

export async function getContacts(): Promise<ContactsOut> {
  const res = await apiFetch(`${API_BASE}/me/contacts`);
  return handleJson<ContactsOut>(res);
}

export async function saveContacts(payload: ContactsPayload): Promise<ContactsOut> {
  const res = await apiFetch(`${API_BASE}/me/contacts`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<ContactsOut>(res);
}

export async function getTodayCheckin(): Promise<Checkin | null> {
  const res = await apiFetch(`${API_BASE}/checkins/today`);
  if (res.status === 404) {
    return null;
  }
  return handleJson<Checkin>(res);
}

export async function upsertToday(payload: CheckinPayload): Promise<Checkin> {
  const res = await apiFetch(`${API_BASE}/checkins/today`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<Checkin>(res);
}

export async function updateCheckin(date: string, payload: CheckinPayload): Promise<Checkin> {
  const res = await apiFetch(`${API_BASE}/checkins/${date}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<Checkin>(res);
}

export async function getStats(): Promise<Stats> {
  const res = await apiFetch(`${API_BASE}/checkins/stats`);
  return handleJson<Stats>(res);
}

export async function getSummary(days = 14): Promise<Summary> {
  const res = await apiFetch(`${API_BASE}/checkins/summary?days=${days}`);
  return handleJson<Summary>(res);
}

export async function getCheckins(params: {
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
}): Promise<Checkin[]> {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.offset) search.set("offset", String(params.offset));
  if (params.order) search.set("order", params.order);
  const res = await apiFetch(`${API_BASE}/checkins?${search.toString()}`);
  return handleJson<Checkin[]>(res);
}

export async function getFriends(): Promise<Friend[]> {
  const res = await apiFetch(`${API_BASE}/friends`);
  return handleJson<Friend[]>(res);
}

export async function requestFriend(payload: FriendRequestPayload): Promise<Friend> {
  const res = await apiFetch(`${API_BASE}/friends/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<Friend>(res);
}

export async function acceptFriend(payload: FriendAcceptPayload): Promise<Friend> {
  const res = await apiFetch(`${API_BASE}/friends/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<Friend>(res);
}

export async function getFriendDetail(friendId: number): Promise<FriendDetail> {
  const res = await apiFetch(`${API_BASE}/friends/${friendId}`);
  return handleJson<FriendDetail>(res);
}

export async function updateFriendPermission(
  friendId: number,
  payload: FriendPermission
): Promise<FriendPermission> {
  const res = await apiFetch(`${API_BASE}/friends/${friendId}/permission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<FriendPermission>(res);
}

export async function remindFriend(friendId: number): Promise<RemindResult> {
  const res = await apiFetch(`${API_BASE}/friends/${friendId}/remind`, {
    method: "POST"
  });
  return handleJson<RemindResult>(res);
}

export async function encourageFriend(
  friendId: number,
  payload: EncouragePayload
): Promise<{ sent: boolean }> {
  const res = await apiFetch(`${API_BASE}/friends/${friendId}/encourage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson<{ sent: boolean }>(res);
}

export async function getNotifications(params: {
  limit?: number;
  unread_only?: boolean;
}): Promise<Notification[]> {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.unread_only) search.set("unread_only", "true");
  const res = await apiFetch(`${API_BASE}/notifications?${search.toString()}`);
  return handleJson<Notification[]>(res);
}

export async function markNotificationRead(notificationId: number): Promise<void> {
  const res = await apiFetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "POST"
  });
  await handleJson(res);
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await apiFetch(`${API_BASE}/notifications/read-all`, {
    method: "POST"
  });
  await handleJson(res);
}

export async function getGroups(): Promise<GroupSummary[]> {
  const res = await apiFetch(`${API_BASE}/groups`);
  return handleJson<GroupSummary[]>(res);
}

export async function getGroupDetail(groupId: number): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}`);
  return handleJson<GroupDetail>(res);
}

export async function createGroup(payload: GroupCreatePayload): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return handleJson<GroupDetail>(res);
}

export async function joinGroup(payload: GroupJoinPayload): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups/join`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return handleJson<GroupDetail>(res);
}

export async function updateGroupAnnouncement(
  groupId: number,
  announcement: string
): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/announcement`, {
    method: "POST",
    body: JSON.stringify({ announcement })
  });
  return handleJson<GroupDetail>(res);
}

export async function updateGroupName(groupId: number, name: string): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/name`, {
    method: "POST",
    body: JSON.stringify({ name })
  });
  return handleJson<GroupDetail>(res);
}

export async function rotateGroupInviteCode(groupId: number): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/invite-code`, {
    method: "POST"
  });
  return handleJson<GroupDetail>(res);
}

export async function getGroupEncouragements(groupId: number): Promise<GroupEncouragePost[]> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/encouragements`);
  return handleJson<GroupEncouragePost[]>(res);
}

export async function sendGroupEncouragement(
  groupId: number,
  payload: GroupEncouragePayload
): Promise<void> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/encourage`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  await handleJson(res);
}

export async function sendGroupReminder(groupId: number): Promise<void> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/remind`, {
    method: "POST"
  });
  await handleJson(res);
}

export async function approveGroupMember(groupId: number, userId: number): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/members/${userId}/approve`, {
    method: "POST"
  });
  return handleJson<GroupDetail>(res);
}

export async function rejectGroupMember(groupId: number, userId: number): Promise<GroupDetail> {
  const res = await apiFetch(`${API_BASE}/groups/${groupId}/members/${userId}/reject`, {
    method: "POST"
  });
  return handleJson<GroupDetail>(res);
}
