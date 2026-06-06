// Module-level cache: survives page navigation, used by AlertCenter (pre-fetch on
// SignalR) and AlertDetailModal (read on open) to avoid redundant AI API calls.
export const aiSuggestionCache = new Map<
  string | number,
  { response: string | null; error: string | null }
>();
