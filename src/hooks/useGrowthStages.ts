import { useEffect, useState } from "react";
import { getGrowthStages } from "../api/growth-stages";
import type { GrowthStage } from "../types/growth-stage";

export default function useGrowthStages() {
  const [stages, setStages] = useState<GrowthStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getGrowthStages();
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
  }, []);

  return { stages, setStages, loading, error } as const;
}
