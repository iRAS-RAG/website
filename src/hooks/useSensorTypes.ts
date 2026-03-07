import { useEffect, useState } from "react";
import { getSensorTypes } from "../api/sensor-types";
import type { SensorType } from "../types/sensor-type";

export default function useSensorTypes() {
  const [items, setItems] = useState<SensorType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getSensorTypes()
      .then((d) => {
        if (!mounted) return;
        setItems(d);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading };
}
