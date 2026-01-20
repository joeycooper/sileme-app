import { useCallback, useEffect, useState } from "react";

type AsyncValueOptions<T> = {
  load: () => Promise<T>;
  onError?: (message: string) => void;
  initialLoad?: boolean;
  initialValue?: T | null;
};

export function useAsyncValue<T>({
  load,
  onError,
  initialLoad = true,
  initialValue = null
}: AsyncValueOptions<T>) {
  const [value, setValue] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await load();
      setValue(next);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [load, onError]);

  useEffect(() => {
    if (initialLoad) {
      void refresh();
    }
  }, [initialLoad, refresh]);

  return { value, setValue, loading, refresh };
}
