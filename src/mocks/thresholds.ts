export type Threshold = { id: string; sensor: string; min: number; max: number; unit: string };

let thresholds: Threshold[] = [
  { id: "t-1", sensor: "pH", min: 6.8, max: 8.2, unit: "pH" },
  { id: "t-2", sensor: "DO", min: 5, max: 12, unit: "mg/L" },
];

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function fetchThresholds(): Promise<Threshold[]> {
  await wait();
  return thresholds.map((t) => ({ ...t }));
}

export async function createThreshold(payload: Omit<Threshold, "id">): Promise<Threshold> {
  await wait();
  const newItem: Threshold = { id: `th${Date.now()}`, ...payload };
  thresholds.push(newItem);
  return { ...newItem };
}

export async function updateThreshold(id: string, payload: Partial<Threshold>): Promise<Threshold | null> {
  await wait();
  const idx = thresholds.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  thresholds[idx] = { ...thresholds[idx], ...payload };
  return { ...thresholds[idx] };
}

export async function deleteThreshold(id: string): Promise<boolean> {
  await wait();
  const before = thresholds.length;
  thresholds = thresholds.filter((t) => t.id !== id);
  return thresholds.length < before;
}

export { thresholds, thresholds as thresholdsList };
