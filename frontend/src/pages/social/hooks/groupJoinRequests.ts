import { useCallback, useState } from "react";
import type { GroupDetail } from "../../../services/api";
import { useGroupJoinCooldown } from "./groupJoinCooldown";

export function useGroupJoinRequests(selectedGroup: GroupDetail | null) {
  const [requests, setRequests] = useState<Record<number, number>>({});
  const groupJoinCooldown = useGroupJoinCooldown(selectedGroup, requests);

  const markGroupJoinRequest = useCallback((groupId: number) => {
    setRequests((prev) => ({ ...prev, [groupId]: Date.now() }));
  }, []);

  return { groupJoinCooldown, markGroupJoinRequest };
}
