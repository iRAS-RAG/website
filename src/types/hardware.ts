export type SensorType = {
  id: string;
  name: string;
  description?: string;
};

export type MasterBoard = {
  id: string;
  name: string;
  macAddress?: string;
  fishTankName?: string;
};

export type Sensor = {
  id: string;
  name: string;
  pinCode?: number;
  sensorTypeName?: string;
  masterBoardId?: string;
  masterBoardName?: string;
};

export type ControlDevice = {
  id: string;
  name: string;
  pinCode?: number;
  state?: boolean;
  commandOn?: string;
  commandOff?: string;
  masterBoardId?: string;
  masterBoardName?: string;
  controlDeviceTypeName?: string;
};

export type Tank = {
  id: string;
  name: string;
  height?: number;
  radius?: number;
  farmId?: string;
  farmName?: string;
  topicCode?: string;
  cameraUrl?: string;
};

export default {};
