import { useCallback, useEffect, useRef, useState } from "react";

export type NoticeHandlers = {
  showNotice: (message: string) => void;
  showError: (message: string) => void;
};

type NoticeOptions = {
  durationMs?: number;
};

export function useNotice(options: NoticeOptions = {}) {
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);
  const durationMs = options.durationMs ?? 2000;

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, durationMs);
  }, [durationMs]);

  const showError = useCallback(
    (message: string) => {
      showNotice(message);
    },
    [showNotice]
  );

  return { notice, showNotice, showError };
}
