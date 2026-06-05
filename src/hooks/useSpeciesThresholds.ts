import { useCallback, useEffect, useState } from "react";
import { createSpeciesThreshold, deleteSpeciesThreshold, getSpeciesThresholds, updateSpeciesThreshold } from "../api/species-threshholds";
import type { SpeciesThreshold, SpeciesThresholdCreate } from "../types/species-threshold";

export default function useSpeciesThresholds() {
  const [items, setItems] = useState<SpeciesThreshold[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSpeciesThresholds();
      setItems(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function create(item: SpeciesThresholdCreate) {
    setLoading(true);
    try {
      const created = await createSpeciesThreshold(item);
      setItems((s) => [created, ...s]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function update(id: string, patch: Partial<SpeciesThresholdCreate>) {
    setLoading(true);
    try {
      const updated = await updateSpeciesThreshold(id, patch);
      if (updated) setItems((s) => s.map((it) => (it.id === id ? updated : it)));
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setLoading(true);
    try {
      await deleteSpeciesThreshold(id);
      setItems((s) => s.filter((it) => it.id !== id));
      return true;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { items, loading, error, refresh: fetchAll, create, update, remove } as const;
}
