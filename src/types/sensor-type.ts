export type SensorType = {
  id: string;
  name: string;
  measureType?: string;
  unit?: string;
};

export type SensorTypeCreate = {
  name: string;
  measureType?: string;
  unit?: string;
};
