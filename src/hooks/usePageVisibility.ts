import { useEffect, useRef } from "react";

/**
 * Hook that tracks page visibility (tab switch, minimize, etc.).
 * Calls `onVisible` when the page becomes visible again after being hidden.
 * Useful for restarting SignalR connections that the browser paused.
 */
export function usePageVisibility(onVisible?: () => void) {
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && onVisibleRef.current) {
        onVisibleRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
