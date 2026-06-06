import { useEffect, useState } from "react";
import { getMe } from "../api/users";
import type { User } from "../types/user";

const CACHE_KEY = "cachedUserProfile";

function loadCachedProfile(): User | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === "string" && typeof parsed.name === "string") {
      return parsed as User;
    }
    return null;
  } catch {
    return null;
  }
}

function saveCachedProfile(profile: User) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

/**
 * Hook that returns the current user profile, initialized from localStorage cache
 * to prevent UI flash to empty/default state on remount.
 *
 * Fetches fresh data from the API in the background after mount.
 */
export function useCachedProfile() {
  const [profile, setProfile] = useState<User | null>(loadCachedProfile);

  useEffect(() => {
    getMe()
      .then((user) => {
        saveCachedProfile(user);
        setProfile(user);
      })
      .catch(() => {
        // Keep showing cached data on fetch failure
      });
  }, []);

  return profile;
}
