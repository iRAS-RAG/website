import { useEffect, useState } from "react";
import { createControlDevice, getControlDevices, updateControlDevice } from "../api/control-devices";
import type { ControlDevice } from "../types/control-device";

export type ControlDeviceSaveInput = {
  name: string;
  pinCode?: number;
  masterBoardId?: string | null;
  controlDeviceTypeName?: string;
  state?: boolean;
};

export default function useControlDevices() {
  const [loading, setLoading] = useState(true);
  const [controlDevices, setControlDevices] = useState<ControlDevice[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getControlDevices();
        if (!mounted) return;
        setControlDevices(data);
      } catch (error) {
        console.error("Failed to load control devices:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveControl(value: ControlDeviceSaveInput, editingControlId?: string | null) {
    if (editingControlId) {
      const updated = await updateControlDevice(editingControlId, {
        name: value.name,
        pinCode: value.pinCode,
        masterBoardId: value.masterBoardId ?? undefined,
        controlDeviceTypeName: value.controlDeviceTypeName ?? undefined,
        state: value.state,
      });
      if (!updated) throw new Error("Update failed");
      setControlDevices((prev) => prev.map((device) => (device.id === updated.id ? updated : device)));
      return;
    }

    const created = await createControlDevice({
      name: value.name,
      pinCode: value.pinCode,
      masterBoardId: value.masterBoardId ?? undefined,
      controlDeviceTypeName: value.controlDeviceTypeName ?? undefined,
      state: value.state,
    });
    setControlDevices((prev) => [...prev, created]);
  }

  return {
    loading,
    controlDevices,
    handleSaveControl,
  } as const;
}
