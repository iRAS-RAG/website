import { HubConnection, HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/client";
import { getAccessToken } from "../api/jwt";
import { usePageVisibility } from "./usePageVisibility";

const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/supervisor-metrics";

export interface SupervisorMetricsHandlers {
  onFeeding?: (payload: Record<string, unknown>) => void;
  onMortality?: (payload: Record<string, unknown>) => void;
  /** Called after the connection was lost and has been restored (reconnect or tab-visible). */
  onReconnect?: () => void;
}

export function useSupervisorMetricsSignalR(farmId?: string, handlers?: SupervisorMetricsHandlers) {
  const connRef = useRef<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef(handlers);
  const farmIdRef = useRef(farmId);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    farmIdRef.current = farmId;
  }, [farmId]);

  useEffect(() => {
    let cancelled = false;

    const buildAndRegister = (transport?: number) => {
      const opts: Record<string, unknown> = { accessTokenFactory: () => getAccessToken() ?? "" };
      if (transport) opts.transport = transport;
      const conn = new HubConnectionBuilder().withUrl(HUB_URL, opts).withAutomaticReconnect().build();

      conn.on("FeedingLogCreated", (payload) => {
        handlersRef.current?.onFeeding?.(payload);
      });

      conn.on("MortalityLogCreated", (payload) => {
        handlersRef.current?.onMortality?.(payload);
      });

      conn.onreconnected(async () => {
        const fid = farmIdRef.current;
        if (fid) {
          try {
            await conn.invoke("JoinFarmGroup", fid);
          } catch {
            console.warn("[SupervisorMetrics] Failed to re-join farm group after reconnect");
          }
        }
        // Trigger data refresh so any missed events are picked up
        handlersRef.current?.onReconnect?.();
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
            console.warn("[SupervisorMetrics] Failed to join farm group on connect");
          }
        }
      })
      .catch(async (err) => {
        if (cancelled) return;
        console.warn("[SupervisorMetrics] WebSocket connection failed, falling back to LongPolling:", (err as Error)?.message ?? err);
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
              console.warn("[SupervisorMetrics] Failed to join farm group on LP connect");
            }
          }
        } catch (lpErr) {
          console.warn("[SupervisorMetrics] LongPolling fallback also failed:", (lpErr as Error)?.message ?? lpErr);
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

  // On tab visibility restore, restart the connection if the browser paused it.
  const handlePageVisible = useCallback(() => {
    const c = connRef.current;
    if (c && c.state === "Disconnected") {
      console.log("[SupervisorMetrics] Tab visible, restarting connection");
      c.start()
        .then(async () => {
          setConnected(true);
          const fid = farmIdRef.current;
          if (fid) {
            try {
              await c.invoke("JoinFarmGroup", fid);
            } catch {
              console.warn("[SupervisorMetrics] Failed to join farm group on visibility restore");
            }
          }
          // Refetch data after reconnection
          handlersRef.current?.onReconnect?.();
        })
        .catch(() => {
          // Build a LongPolling fallback
          const opts: Record<string, unknown> = {
            accessTokenFactory: () => getAccessToken() ?? "",
            transport: HttpTransportType.LongPolling,
          };
          const lp = new HubConnectionBuilder().withUrl(HUB_URL, opts).withAutomaticReconnect().build();
          lp.on("FeedingLogCreated", (payload: Record<string, unknown>) => {
            handlersRef.current?.onFeeding?.(payload);
          });
          lp.on("MortalityLogCreated", (payload: Record<string, unknown>) => {
            handlersRef.current?.onMortality?.(payload);
          });
          lp.onreconnected(async () => {
            const fid = farmIdRef.current;
            if (fid) {
              try {
                await lp.invoke("JoinFarmGroup", fid);
              } catch {
                console.warn("[SupervisorMetrics] Failed to re-join farm group after LP reconnect");
              }
            }
            handlersRef.current?.onReconnect?.();
          });
          connRef.current = lp;
          lp.start()
            .then(async () => {
              setConnected(true);
              const fid = farmIdRef.current;
              if (fid) {
                try {
                  await lp.invoke("JoinFarmGroup", fid);
                } catch {
                  console.warn("[SupervisorMetrics] Failed to join farm group on LP visibility restore");
                }
              }
              handlersRef.current?.onReconnect?.();
            })
            .catch((err) => {
              console.warn("[SupervisorMetrics] Visibility restore LP also failed:", (err as Error)?.message ?? err);
              setConnected(false);
            });
        });
    }
  }, []);

  usePageVisibility(handlePageVisible);

  const joinFarmGroup = useCallback(async (id: string) => {
    const conn = connRef.current;
    if (!conn) return;
    try {
      await conn.invoke("JoinFarmGroup", id);
    } catch {
      console.warn("[SupervisorMetrics] Failed to join farm group via imperative call");
    }
  }, []);

  return { connected, joinFarmGroup } as const;
}

export default useSupervisorMetricsSignalR;
