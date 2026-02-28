import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedType } from "../api/feed-types";
import { createFeedType, deleteFeedType, getFeedTypes, updateFeedType } from "../api/feed-types";

export default function useFeedTypes() {
  const [feeds, setFeeds] = useState<FeedType[]>([]);
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);
  const [links, setLinks] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastParams = useRef<Record<string, unknown> | undefined>(undefined);

  const load = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      lastParams.current = params;
      const res = await getFeedTypes(params);
      setFeeds(res.items);
      setMeta(res.meta ?? null);
      setLinks(res.links ?? null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (payload: Omit<FeedType, "id">) => {
      await createFeedType(payload);
      await load(lastParams.current);
    },
    [load],
  );

  const update = useCallback(
    async (id: string, payload: Partial<FeedType>) => {
      await updateFeedType(id, payload);
      await load(lastParams.current);
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteFeedType(id);
      await load(lastParams.current);
    },
    [load],
  );

  return { feeds, meta, links, loading, error, load, create, update, remove };
}
