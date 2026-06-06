import { useEffect, useRef, useState } from "react";
import { getSpecies } from "../api/species";

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export type SensorThreshold = {
  id?: string;
  sensor: string;
  sensorTypeId?: string;
  min: number | null;
  max: number | null;
};
export type Stage = {
  id: string;
  name: string;
  growthStageId?: string;
  configId?: string;
  feedType: string;
  // Support multiple feed types returned from backend
  feedTypeIds?: string[];
  // Order of this stage within the species
  sequence?: number;
  feedPer100: number; // kg per 100 fishes
  frequencyPerDay: number;
  maxStockingDensity: number; // per cubic meter
  expectedDurationDays: number;
  // New fields added by API
  expectedWeightKgPerFish: number;
  survivalRate: number;
  thresholds: SensorThreshold[];
};

export type SpeciesConfig = { id: string; name: string; stages: Stage[] };

const STORAGE_KEY = "speciesConfigs:v1";

function defaultStage(name = "Stage 1"): Stage {
  return {
    id: generateId(),
    name,
    feedType: "",
    feedTypeIds: [],
    feedPer100: 1,
    frequencyPerDay: 1,
    maxStockingDensity: 1,
    expectedDurationDays: 1,
    expectedWeightKgPerFish: 1,
    survivalRate: 1,
    thresholds: [],
  };
}

export default function useSpeciesConfigs() {
  // SỬA LỖI 1: Sử dụng lazy initialization để đọc localStorage, tránh gọi setState trong useEffect
  const [speciesConfigs, setSpeciesConfigs] = useState<SpeciesConfig[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // SỬA LỖI 2: Bỏ biến 'e' (no-unused-vars)
        /* ignore parse error */
      }
    }
    return [];
  });

  const fetchedRef = useRef(false);

  useEffect(() => {
    // Skip the second invocation in React StrictMode (dev double-fire).
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let isMounted = true; // Tránh memory leak khi component unmount

    // Always attempt to refresh from API (update cache & UI)
    (async () => {
      try {
        const items = await getSpecies();
        const configs = items.map((s) => ({
          id: s.id,
          name: s.name,
          stages: [],
        }));

        if (isMounted) {
          setSpeciesConfigs(configs);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
          } catch {
            // SỬA LỖI 3: Thêm comment cho khối catch trống (no-empty)
            /* ignore storage quota error */
          }
        }
      } catch (error) {
        // Ghi log lỗi thay vì bỏ không
        console.error("Failed to fetch species API", error);

        // If API fails and we had no cache, ensure empty list
        if (!localStorage.getItem(STORAGE_KEY) && isMounted) {
          setSpeciesConfigs([]);
        }
      }
    })();

    return () => {
      isMounted = false;
      fetchedRef.current = false; // Allow re-fetch on StrictMode re-mount
    };
  }, []);

  function persist(next: SpeciesConfig[]) {
    setSpeciesConfigs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage quota error */
    }
  }

  function persistUpdater(updater: (prev: SpeciesConfig[]) => SpeciesConfig[]) {
    setSpeciesConfigs((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore storage quota error */
      }
      return next;
    });
  }

  function updateStageThreshold(speciesId: string, stageId: string, sensor: string, min: number | null, max: number | null, id?: string) {
    persistUpdater((prev) =>
      prev.map((sp) => {
        if (sp.id !== speciesId) return sp;
        return {
          ...sp,
          stages: sp.stages.map((st) => {
            if (st.id !== stageId) return st;
            const idx = st.thresholds.findIndex((t) => t.sensor === sensor);
            const thresholds = [...st.thresholds];
            if (idx !== -1) {
              thresholds[idx] = { id, sensor, min, max };
            } else {
              thresholds.push({ id, sensor, min, max });
            }
            return { ...st, thresholds };
          }),
        };
      }),
    );
  }

  function addStage(speciesId: string, growthStageId?: string, name?: string) {
    persistUpdater((prev) =>
      prev.map((sp) => {
        if (sp.id !== speciesId) return sp;
        // prevent duplicate growthStageId
        if (growthStageId && sp.stages.some((s) => s.growthStageId === growthStageId)) return sp;
        const st = defaultStage(name);
        if (growthStageId) st.growthStageId = growthStageId;
        if (name) st.name = name;
        return { ...sp, stages: [...sp.stages, st] };
      }),
    );
  }

  function updateStage(speciesId: string, stageId: string, patch: Partial<Stage>) {
    persistUpdater((prev) =>
      prev.map((sp) => {
        if (sp.id !== speciesId) return sp;
        return {
          ...sp,
          stages: sp.stages.map((st) => (st.id === stageId ? { ...st, ...patch } : st)),
        };
      }),
    );
  }

  function removeStage(speciesId: string, stageId: string) {
    persistUpdater((prev) => prev.map((sp) => (sp.id === speciesId ? { ...sp, stages: sp.stages.filter((s) => s.id !== stageId) } : sp)));
  }

  return {
    speciesConfigs,
    setSpeciesConfigs: persist,
    updateStageThreshold,
    addStage,
    updateStage,
    removeStage,
  } as const;
}
