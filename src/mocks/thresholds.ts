export type Threshold = { id: string; sensor: string; min: number; max: number; unit: string };

export const thresholds: Threshold[] = [
  { id: "t-1", sensor: "pH", min: 6.8, max: 8.2, unit: "pH" },
  { id: "t-2", sensor: "DO", min: 5, max: 12, unit: "mg/L" },
];
