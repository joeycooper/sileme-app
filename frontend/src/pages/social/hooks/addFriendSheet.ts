import { useCallback, useState } from "react";

type AddFriendSheetDeps = {
  handleRequest: (onSuccess?: () => void) => Promise<void> | void;
};

export function useAddFriendSheet({ handleRequest }: AddFriendSheetDeps) {
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => setOpen(false), []);
  const onOpen = useCallback(() => setOpen(true), []);

  const handleSubmit = useCallback(async () => {
    await handleRequest(() => setOpen(false));
  }, [handleRequest]);

  return {
    open,
    onOpen,
    onClose,
    handleSubmit
  };
}
