import { useCallback, useState } from "react";
import type { Friend, FriendDetail } from "../../../services/api";
import { getFriendDetail } from "../../../services/api";

export function useFriendDetails(showError: (message: string) => void) {
  const [details, setDetails] = useState<Record<number, FriendDetail>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleToggleDetail = useCallback(
    async (friend: Friend) => {
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
          showError(err instanceof Error ? err.message : "加载失败");
        }
      }
    },
    [details, selectedId, showError]
  );

  return { details, setDetails, selectedId, setSelectedId, handleToggleDetail };
}
