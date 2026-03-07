import { useEffect, useState } from "react";
import { createControlDevice, deleteControlDevice, getControlDevices, updateControlDevice } from "../api/control-devices";
import type { ControlDevice } from "../types/control-device";

export type ControlDeviceSaveInput = {
  name: string;
  pinCode?: number;
  masterBoardId?: string | null;
  controlDeviceTypeId?: string | null;
  state?: boolean;
  commandOn?: string;
  commandOff?: string;
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
        controlDeviceTypeId: value.controlDeviceTypeId ?? undefined,
        state: value.state,
        commandOn: value.commandOn,
        commandOff: value.commandOff,
      });
      if (!updated) throw new Error("Update failed");
      const refreshed = await getControlDevices();
      setControlDevices(refreshed);
      return;
    }

    await createControlDevice({
      name: value.name,
      pinCode: value.pinCode,
      masterBoardId: value.masterBoardId ?? undefined,
      controlDeviceTypeId: value.controlDeviceTypeId ?? undefined,
      state: value.state,
      commandOn: value.commandOn,
      commandOff: value.commandOff,
    });
    const refreshed = await getControlDevices();
    setControlDevices(refreshed);
  }

  async function handleDeleteControl(id?: string | null) {
    if (!id) throw new Error("No control device selected");
    await deleteControlDevice(id);
    setControlDevices((prev) => prev.filter((device) => device.id !== id));
  }

  return {
    loading,
    controlDevices,
    handleSaveControl,
    handleDeleteControl,
  } as const;
}
