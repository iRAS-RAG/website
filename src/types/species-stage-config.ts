export type SpeciesStageConfig = {
  id: string;
  speciesId?: string;
  speciesName?: string;
  growthStageId?: string;
  growthStageName?: string;
  // Backend now returns multiple feed types per stage
  feedTypeIds?: string[];
  feedTypeNames?: string[];
  // Order of the stage within the species' stage list
  sequence?: number;
  amountPer100Fish?: number;
  frequencyPerDay?: number;
  maxStockingDensity?: number;
  expectedDurationDays?: number;
  expectedWeightKgPerFish?: number;
  survivalRate?: number;
};

export type SpeciesStageConfigCreate = {
  speciesId: string;
  growthStageId: string;
  // Create payload now accepts multiple feed type ids and an optional sequence
  feedTypeIds: string[];
  sequence?: number;
  amountPer100Fish: number;
  frequencyPerDay: number;
  maxStockingDensity: number;
  expectedDurationDays: number;
  expectedWeightKgPerFish?: number;
  survivalRate?: number;
};
