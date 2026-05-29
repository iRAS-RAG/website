import { HubConnection, HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/client";
import { getAccessToken } from "../api/jwt";

const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/supervisor-metrics";

export function useSupervisorMetricsSignalR(farmId?: string, handlers?: { onFeeding?: (payload: any) => void; onMortality?: (payload: any) => void }) {
  const connRef = useRef<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    let cancelled = false;

    const buildAndRegister = (transport?: number) => {
      const opts: any = { accessTokenFactory: () => getAccessToken() ?? "" };
      if (transport) opts.transport = transport;
      const conn = new HubConnectionBuilder().withUrl(HUB_URL, opts).withAutomaticReconnect().build();

      conn.on("FeedingLogCreated", (payload) => {
        handlersRef.current?.onFeeding?.(payload);
      });

      conn.on("MortalityLogCreated", (payload) => {
        handlersRef.current?.onMortality?.(payload);
      });

      conn.onreconnected(async () => {
        try {
          if (farmId) await conn.invoke("JoinFarmGroup", farmId);
        } catch (e) {
          // ignore
        }
      });

      return conn;
    };

    const connection = buildAndRegister();
    connRef.current = connection;

    connection
      .start()
      .then(async () => {
        if (cancelled) return;
        setConnected(true);
        if (farmId) {
          try {
            await connection.invoke("JoinFarmGroup", farmId);
          } catch {
            // ignore
          }
        }
      })
      .catch(async () => {
        if (cancelled) return;
        // try long polling fallback
        try {
          const lp = buildAndRegister(HttpTransportType.LongPolling);
          connRef.current = lp;
          await lp.start();
          if (cancelled) {
            lp.stop().catch(() => {});
            return;
          }
          setConnected(true);
          if (farmId) {
            try {
              await lp.invoke("JoinFarmGroup", farmId);
            } catch {
              // ignore
            }
          }
        } catch (e) {
          setConnected(false);
        }
      });

    return () => {
      cancelled = true;
      connRef.current?.stop().catch(() => {});
      connRef.current = null;
      setConnected(false);
    };
  }, [farmId]);

  const joinFarmGroup = useCallback(async (id: string) => {
    const conn = connRef.current;
    if (!conn) return;
    try {
      await conn.invoke("JoinFarmGroup", id);
    } catch (e) {
      // ignore
    }
  }, []);

  return { connected, joinFarmGroup } as const;
}

export default useSupervisorMetricsSignalR;
