import { useEffect, useState } from "react";
import { getTanks, updateTank } from "../api/tanks";
import type { Tank } from "../types/tank";

export type TankUpdatePayload = {
  name: string;
  height?: number;
  radius?: number;
  farmId?: string;
  topicCode?: string;
  cameraUrl?: string;
};

export default function useTanks() {
  const [loading, setLoading] = useState(true);
  const [tanks, setTanks] = useState<Tank[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getTanks();
        if (!mounted) return;
        setTanks(data);
      } catch (error) {
        console.error("Failed to load tanks:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleUpdateTank(payload: TankUpdatePayload, id?: string | null) {
    if (!id) throw new Error("No tank selected");
    const updated = await updateTank(id, payload);
    if (!updated) throw new Error("Update failed");
    setTanks((prev) => prev.map((tank) => (tank.id === id ? updated : tank)));
  }

  return {
    loading,
    tanks,
    handleUpdateTank,
  } as const;
}
