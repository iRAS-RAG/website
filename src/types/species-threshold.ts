export type SpeciesThreshold = {
  id: string;
  speciesId?: string;
  speciesName?: string;
  growthStageId?: string;
  growthStageName?: string;
  sensorTypeId?: string;
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
