import { useEffect, useState } from "react";
import { getGrowthStages, getGrowthStagesBySpecies } from "../api/growth-stages";
import type { GrowthStage } from "../types/growth-stage";

export default function useGrowthStages(speciesId?: string) {
  const [stages, setStages] = useState<GrowthStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = speciesId ? await getGrowthStagesBySpecies(speciesId) : await getGrowthStages();
        if (mounted) setStages(res);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [speciesId]);

  return { stages, setStages, loading, error } as const;
}
