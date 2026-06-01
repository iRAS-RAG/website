import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { useEffect, useRef } from "react";
import { API_BASE } from "../api/client";
import { getAccessToken } from "../api/jwt";

const HUB_URL = API_BASE.replace(/\/api\/?$/, "") + "/hubs/alerts";

export interface AlertPush {
  alertId: string;
  tankId: string;
  tankName: string;
  sensorTypeName?: string;
  triggerValue: number;
  minValue: number;
  maxValue: number;
}

interface AlertCreatedNotification {
  alertId: string;
  tankId: string;
}

interface Handlers {
  onReceiveAlert?: (push: AlertPush) => void;
  onAlertCreated?: (notification: AlertCreatedNotification) => void;
}

export function useAlertSignalR(handlers: Handlers) {
  const connRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    let cancelled = false;

    const conn = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => getAccessToken() ?? "" })
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveAlert", (push: AlertPush) => {
      handlersRef.current.onReceiveAlert?.(push);
    });

    conn.on("AlertCreated", (notification: AlertCreatedNotification) => {
      handlersRef.current.onAlertCreated?.(notification);
    });

    conn.start().catch((e) => {
      if (!cancelled) console.error("AlertSignalR connection failed:", e);
    });

    connRef.current = conn;

    return () => {
      cancelled = true;
      conn.stop().catch(() => {});
      connRef.current = null;
    };
  }, []);
}
