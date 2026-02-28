export type SpeciesThreshold = {
  id: string;
  speciesName?: string;
  growthStageName?: string;
  sensorTypeName?: string;
  minValue?: number;
  maxValue?: number;
};

export type SpeciesThresholdCreate = {
  speciesId: string;
  growthStageId: string;
  sensorTypeId: string;
  minValue: number;
  maxValue: number;
};
