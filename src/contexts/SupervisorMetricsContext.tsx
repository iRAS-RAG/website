import React, { createContext, useCallback, useContext, useRef } from "react";
import useSupervisorMetricsSignalR from "../hooks/useSupervisorMetricsSignalR";

/**
 * Shared SignalR context so ALL chart components on the supervisor dashboard
 * share a single WebSocket connection instead of each creating their own.
 *
 * IMPORTANT: The context value is STABLE (subscribe never changes).
 * Children do NOT re-render when the connection state changes.
 */

type Listener = () => void;

interface SupervisorMetricsContextValue {
  subscribe: (listener: Listener) => () => void;
}

const SupervisorMetricsContext = createContext<SupervisorMetricsContextValue | null>(null);

export function useSupervisorMetricsEvents(): SupervisorMetricsContextValue {
  const ctx = useContext(SupervisorMetricsContext);
  if (!ctx) {
    // Graceful fallback for standalone usage outside the provider
    return { subscribe: () => () => {} };
  }
  return ctx;
}

const DEFAULT_FARM_ID = "aaaaaaaa-0000-0000-0000-000000000001";

export const SupervisorMetricsProvider: React.FC<{ farmId?: string; children: React.ReactNode }> = ({
  farmId = DEFAULT_FARM_ID,
  children,
}) => {
  const listenersRef = useRef<Set<Listener>>(new Set());

  // Stable subscribe function — never changes across renders
  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Called on every SignalR event (feeding or mortality log created)
  const notifyAll = useCallback(() => {
    listenersRef.current.forEach((cb) => cb());
  }, []);

  // Called when the connection is restored after being lost
  const onReconnect = useCallback(() => {
    // Small delay so JoinFarmGroup completes before refetching data
    const timer = window.setTimeout(() => notifyAll(), 300);
    return () => window.clearTimeout(timer);
  }, [notifyAll]);

  // ONE shared SignalR connection for all child charts
  useSupervisorMetricsSignalR(farmId, {
    onFeeding: notifyAll,
    onMortality: notifyAll,
    onReconnect,
  });

  // Stable value — subscribe never changes, so context consumers never re-render
  const value = React.useMemo<SupervisorMetricsContextValue>(
    () => ({ subscribe }),
    [subscribe],
  );

  return (
    <SupervisorMetricsContext.Provider value={value}>
      {children}
    </SupervisorMetricsContext.Provider>
  );
};

export default SupervisorMetricsProvider;
