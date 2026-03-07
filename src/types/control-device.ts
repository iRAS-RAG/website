export type ControlDevice = {
  id: string;
  name: string;
  pinCode?: number;
  state?: boolean;
  commandOn?: string;
  commandOff?: string;
  masterBoardId?: string;
  masterBoardName?: string;
  controlDeviceTypeId?: string;
  controlDeviceTypeName?: string;
};
