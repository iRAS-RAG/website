import { useEffect, useState } from "react";
import * as hardwareApi from "../api/hardware";
import type { ControlDevice, MasterBoard, Sensor, SensorType, Tank } from "../types/hardware";

export default function useHardwareData() {
  const [loading, setLoading] = useState(true);
  const [sensorTypes, setSensorTypes] = useState<SensorType[]>([]);
  const [masterBoards, setMasterBoards] = useState<MasterBoard[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [controlDevices, setControlDevices] = useState<ControlDevice[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [st, mb, s, cd, tk] = await Promise.all([hardwareApi.getSensorTypes(), hardwareApi.getMasterBoards(), hardwareApi.getSensors(), hardwareApi.getControlDevices(), hardwareApi.getTanks()]);
        if (!mounted) return;
        setSensorTypes(st);
        setMasterBoards(mb);
        setSensors(s);
        setControlDevices(cd);
        setTanks(tk);
      } catch (error) {
        console.error("Failed to load hardware data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveMasterBoard(v: { name: string; macAddress?: string; fishTankId?: string | null }, editingBoard?: MasterBoard | null) {
    if (editingBoard) {
      const updated = await hardwareApi.updateMasterBoard(editingBoard.id, {
        name: v.name,
        macAddress: v.macAddress ?? undefined,
        fishTankName: v.fishTankId ? tanks.find((t) => t.id === v.fishTankId)?.name : undefined,
      });
      if (!updated) throw new Error("Update failed");
      setMasterBoards((p) => p.map((m) => (m.id === updated.id ? updated : m)));
      setSnackMsg("Cập nhật masterboard thành công");
      setSnackOpen(true);
    } else {
      const created = await hardwareApi.createMasterBoard({
        name: v.name,
        macAddress: v.macAddress ?? undefined,
        fishTankName: v.fishTankId ? tanks.find((t) => t.id === v.fishTankId)?.name : undefined,
      });
      setMasterBoards((p) => [...p, created]);
      setSnackMsg("Tạo masterboard thành công");
      setSnackOpen(true);
    }
  }

  async function handleUpdateTank(payload: { name: string; height?: number; radius?: number; farmId?: string; topicCode?: string; cameraUrl?: string }, id?: string | null) {
    if (!id) throw new Error("No tank selected");
    const updated = await hardwareApi.updateTank(id, payload);
    if (!updated) throw new Error("Update failed");
    setTanks((p) => p.map((t) => (t.id === id ? updated : t)));
    setSnackMsg("Cập nhật bể thành công");
    setSnackOpen(true);
  }

  async function handleSaveSensor(v: { name: string; pinCode?: number; sensorTypeId?: string | null; masterBoardId?: string | null }, editingSensorId?: string | null) {
    if (editingSensorId) {
      const updated = await hardwareApi.updateSensor(editingSensorId, {
        name: v.name,
        pinCode: v.pinCode,
        masterBoardId: v.masterBoardId ?? undefined,
      });
      if (!updated) throw new Error("Update failed");
      setSensors((p) => p.map((s) => (s.id === updated.id ? updated : s)));
      setSnackMsg("Cập nhật cảm biến thành công");
      setSnackOpen(true);
    } else {
      const created = await hardwareApi.createSensor({
        name: v.name,
        pinCode: v.pinCode,
        masterBoardId: v.masterBoardId ?? undefined,
      });
      setSensors((p) => [...p, created]);
      setSnackMsg("Tạo cảm biến thành công");
      setSnackOpen(true);
    }
  }

  async function handleSaveControl(v: { name: string; pinCode?: number; masterBoardId?: string | null; controlDeviceTypeName?: string; state?: boolean }, editingControlId?: string | null) {
    if (editingControlId) {
      const updated = await hardwareApi.updateControlDevice(editingControlId, {
        name: v.name,
        pinCode: v.pinCode,
        masterBoardId: v.masterBoardId ?? undefined,
        controlDeviceTypeName: v.controlDeviceTypeName ?? undefined,
        state: v.state,
      });
      if (!updated) throw new Error("Update failed");
      setControlDevices((p) => p.map((c) => (c.id === updated.id ? updated : c)));
      setSnackMsg("Cập nhật thiết bị điều khiển thành công");
      setSnackOpen(true);
    } else {
      const created = await hardwareApi.createControlDevice({
        name: v.name,
        pinCode: v.pinCode,
        masterBoardId: v.masterBoardId ?? undefined,
        controlDeviceTypeName: v.controlDeviceTypeName ?? undefined,
        state: v.state,
      });
      setControlDevices((p) => [...p, created]);
      setSnackMsg("Tạo thiết bị điều khiển thành công");
      setSnackOpen(true);
    }
  }

  return {
    loading,
    sensorTypes,
    masterBoards,
    sensors,
    controlDevices,
    tanks,
    handleSaveMasterBoard,
    handleUpdateTank,
    handleSaveSensor,
    handleSaveControl,
    snackOpen,
    snackMsg,
    setSnackOpen,
  } as const;
}
