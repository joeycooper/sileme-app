import type { Notification } from "../../../services/api";

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export function noticeKindLabel(kind: string) {
  if (kind === "remind") return "提醒";
  if (kind === "encourage") return "鼓励";
  if (kind === "group_join_request") return "入群申请";
  if (kind === "group_join_approved") return "已通过";
  if (kind === "group_join_rejected") return "已拒绝";
  if (kind === "group_joined") return "已加入";
  return "通知";
}

export function resolveJoinRequestStatus(item: Notification) {
  if (item.kind === "group_join_approved") return "approved";
  if (item.kind === "group_join_rejected") return "rejected";
  if (item.message.includes("已通过")) return "approved";
  if (item.message.includes("已拒绝") || item.message.includes("拒绝")) return "rejected";
  if (item.message.includes("已加入")) return "approved";
  if (item.read_at) return "expired";
  return "pending";
}

export function formatJoinRequestStatus(item: Notification) {
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
