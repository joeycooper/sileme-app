import { useCallback, useEffect, useState } from "react";

type AsyncListOptions<T> = {
  load: () => Promise<T[]>;
  onError?: (message: string) => void;
  initialLoad?: boolean;
};

export function useAsyncList<T>({ load, onError, initialLoad = true }: AsyncListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await load();
      setItems(list);
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

  return { items, setItems, loading, refresh };
}
