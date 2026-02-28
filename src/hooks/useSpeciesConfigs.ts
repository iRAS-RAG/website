import { useEffect, useState } from "react";
import { getSpecies } from "../api/species";

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export type SensorThreshold = { sensor: string; min: number | null; max: number | null };
export type Stage = {
  id: string;
  name: string;
  feedType: string;
  feedPer100: number; // kg per 100 fishes
  frequencyPerDay: number;
  maxStockingDensity: number; // per cubic meter
  expectedDurationDays: number;
  thresholds: SensorThreshold[];
};

export type SpeciesConfig = { id: string; name: string; stages: Stage[] };

const STORAGE_KEY = "speciesConfigs:v1";

function defaultStage(name = "Stage 1"): Stage {
  return {
    id: generateId(),
    name,
    feedType: "",
    feedPer100: 0,
    frequencyPerDay: 1,
    maxStockingDensity: 0,
    expectedDurationDays: 0,
    thresholds: [],
  };
}

export default function useSpeciesConfigs() {
  const [speciesConfigs, setSpeciesConfigs] = useState<SpeciesConfig[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSpeciesConfigs(JSON.parse(raw));
      } catch (e) {
        // ignore parse error
      }
    }

    // Always attempt to refresh from API (update cache & UI)
    (async () => {
      try {
        console.debug("useSpeciesConfigs: fetching species from API...");
        const items = await getSpecies();
        const configs = items.map((s) => ({ id: s.id, name: s.name, stages: [defaultStage()] }));
        setSpeciesConfigs(configs);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
        } catch {}
      } catch (e) {
        // If API fails and we had no cache, ensure empty list
        if (!raw) setSpeciesConfigs([]);
      }
    })();
  }, []);

  function persist(next: SpeciesConfig[]) {
    setSpeciesConfigs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function updateStageThreshold(speciesId: string, stageId: string, sensor: string, min: number | null, max: number | null) {
    const next = speciesConfigs.map((sp) => {
      if (sp.id !== speciesId) return sp;
      return {
        ...sp,
        stages: sp.stages.map((st) => {
          if (st.id !== stageId) return st;
          const other = st.thresholds.filter((t) => t.sensor !== sensor);
          other.push({ sensor, min, max });
          return { ...st, thresholds: other };
        }),
      };
    });
    persist(next);
  }

  function addStage(speciesId: string, name?: string) {
    const next = speciesConfigs.map((sp) => (sp.id === speciesId ? { ...sp, stages: [...sp.stages, defaultStage(name)] } : sp));
    persist(next);
  }

  function updateStage(speciesId: string, stageId: string, patch: Partial<Stage>) {
    const next = speciesConfigs.map((sp) => {
      if (sp.id !== speciesId) return sp;
      return {
        ...sp,
        stages: sp.stages.map((st) => (st.id === stageId ? { ...st, ...patch } : st)),
      };
    });
    persist(next);
  }

  return { speciesConfigs, setSpeciesConfigs: persist, updateStageThreshold, addStage, updateStage };
}
