import { useCallback, useEffect, useState } from "react";
import { GroupDetail, GroupSummary, getGroupDetail, getGroups, getMe } from "../../../services/api";
import { useAsyncList } from "../../../hooks";
import { useAsyncValue } from "../../../hooks";
import { useSheetState } from "../../../hooks";

export function useGroupList(showError: (message: string) => void) {
  const handleError = useCallback(
    (message: string) => {
      showError(message || "群组加载失败");
    },
    [showError]
  );

  const { items, setItems, refresh } = useAsyncList<GroupSummary>({
    load: getGroups,
    onError: handleError
  });

  return { groups: items, setGroups: setItems, refreshGroups: refresh };
}

export function useCurrentUserId() {
  const loadMe = useCallback(async () => {
    const me = await getMe();
    return me.id;
  }, []);

  const { value } = useAsyncValue({
    load: loadMe
  });

  return value ?? null;
}

export function useSelectedGroup(showError: (message: string) => void) {
  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedGroupId === null) {
      setSelectedGroup(null);
      return;
    }
    (async () => {
      try {
        const detail = await getGroupDetail(selectedGroupId);
        setSelectedGroup(detail);
      } catch (err) {
        showError(err instanceof Error ? err.message : "群组详情加载失败");
      }
    })();
  }, [selectedGroupId, showError]);

  return {
    selectedGroup,
    setSelectedGroup,
    selectedGroupId,
    setSelectedGroupId
  };
}

export function useGroupSelection(showError: (message: string) => void) {
  const selectedState = useSelectedGroup(showError);
  const groupEncourage = useSheetState();
  const groupDetail = useSheetState();
  const groupPanel = useSheetState();

  function openGroupDetail(groupId: number) {
    selectedState.setSelectedGroupId(groupId);
    groupDetail.open();
  }

  function openGroupEncourage(groupId: number) {
    selectedState.setSelectedGroupId(groupId);
    groupEncourage.open();
    groupDetail.close();
  }

  return {
    ...selectedState,
    groupEncourageOpen: groupEncourage.isOpen,
    setGroupEncourageOpen: groupEncourage.setIsOpen,
    groupDetailOpen: groupDetail.isOpen,
    setGroupDetailOpen: groupDetail.setIsOpen,
    groupPanelOpen: groupPanel.isOpen,
    setGroupPanelOpen: groupPanel.setIsOpen,
    openGroupDetail,
    openGroupEncourage
  };
}
