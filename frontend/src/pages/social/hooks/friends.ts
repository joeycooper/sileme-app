import { useCallback, useState } from "react";
import { Friend, getFriends } from "../../../services/api";
import { useAsyncList, useFormState } from "../../../hooks";
import type { NoticeHandlers } from "../../../hooks";
import { useFriendActions } from "./friendActions";
import { useFriendDetails } from "./friendDetails";

export function useFriends({
  showNotice,
  showError,
  onAfterNotify
}: NoticeHandlers & { onAfterNotify?: () => void }) {
  const handleError = useCallback(
    (message: string) => {
      showError(message || "加载失败");
    },
    [showError]
  );

  const { items: friends, loading, refresh } = useAsyncList<Friend>({
    load: getFriends,
    onError: handleError
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [encourageChoice, setEncourageChoice] = useState("💪");
  const { form, updateField, resetForm } = useFormState({
    phone: "",
    message: ""
  });
  const { details, setDetails, selectedId, setSelectedId, handleToggleDetail } =
    useFriendDetails(showError);

  const {
    handleRequest,
    handleAccept,
    handlePermissionUpdate,
    handleRemind,
    handleEncourage
  } = useFriendActions({
    showNotice,
    showError,
    onAfterNotify,
    form,
    resetForm,
    refresh,
    setSubmitting,
    setActionLoadingId,
    encourageChoice,
    setDetails
  });

  return {
    friends,
    details,
    selectedId,
    loading,
    submitting,
    actionLoadingId,
    encourageChoice,
    setEncourageChoice,
    form,
    updateField,
    refresh,
    handleRequest,
    handleAccept,
    handleToggleDetail,
    handlePermissionUpdate,
    handleRemind,
    handleEncourage
  };
}
