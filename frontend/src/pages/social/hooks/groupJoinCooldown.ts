import { useMemo } from "react";
import type { GroupDetail } from "../../../services/api";

export function useGroupJoinCooldown(
  selectedGroup: GroupDetail | null,
  groupJoinRequests: Record<number, number>
) {
  return useMemo(() => {
    if (!selectedGroup) return null;
    const last = groupJoinRequests[selectedGroup.id];
    if (!last) return null;
    const remainingMs = 24 * 60 * 60 * 1000 - (Date.now() - last);
    return remainingMs > 0 ? remainingMs : null;
  }, [groupJoinRequests, selectedGroup]);
}
