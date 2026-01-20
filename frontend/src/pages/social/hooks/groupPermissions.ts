import type { GroupDetail } from "../../../services/api";

export function useGroupPermissions(currentUserId: number | null) {
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

  return { isGroupMember, isGroupAdmin };
}
