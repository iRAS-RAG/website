export type SpeciesStageConfig = {
  id: string;
  speciesName?: string;
  growthStageName?: string;
  feedTypeName?: string;
  amountPer100Fish?: number;
  frequencyPerDay?: number;
  maxStockingDensity?: number;
  expectedDurationDays?: number;
};

export type SpeciesStageConfigCreate = {
  speciesId: string;
  growthStageId: string;
  feedTypeId: string;
  amountPer100Fish: number;
  frequencyPerDay: number;
  maxStockingDensity: number;
  expectedDurationDays: number;
};
