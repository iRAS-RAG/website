import { useCallback, useEffect, useState } from "react";
import { createSpeciesStageConfig, deleteSpeciesStageConfig, getSpeciesStageConfigs, updateSpeciesStageConfig } from "../api/species-stage-configs";
import type { SpeciesStageConfig, SpeciesStageConfigCreate } from "../types/species-stage-config";

export default function useSpeciesStageConfigs() {
  const [configs, setConfigs] = useState<SpeciesStageConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getSpeciesStageConfigs();
      setConfigs(items);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  async function createConfig(payload: SpeciesStageConfigCreate) {
    setLoading(true);
    try {
      const created = await createSpeciesStageConfig(payload);
      setConfigs((s) => [created, ...s]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function updateConfig(id: string, payload: Partial<SpeciesStageConfigCreate>) {
    setLoading(true);
    try {
      const updated = await updateSpeciesStageConfig(id, payload);
      if (updated) setConfigs((s) => s.map((it) => (it.id === id ? updated : it)));
      return updated;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function removeConfig(id: string) {
    setLoading(true);
    try {
      await deleteSpeciesStageConfig(id);
      setConfigs((s) => s.filter((it) => it.id !== id));
      return true;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    configs,
    loading,
    error,
    refresh: fetchConfigs,
    createConfig,
    updateConfig,
    removeConfig,
  } as const;
}
