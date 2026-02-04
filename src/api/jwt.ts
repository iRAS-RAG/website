export type JwtPayload = Record<string, any>;

function base64UrlDecode(input: string) {
  // Make base64url -> base64
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  else if (pad !== 0) base64 += "";
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), function (c: string) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
  } catch (e) {
    // fallback to plain atob -> string
    return atob(base64);
  }
}

export function parseJwt(token: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

export function getRoleFromToken(token: string): string | null {
  const p = parseJwt(token);
  if (!p) return null;
  return p.role || (Array.isArray(p.roles) && p.roles[0]) || p.roleName || p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
}

export function getUserFromToken(token: string) {
  const p = parseJwt(token) || {};
  return {
    id: p.sub || p.nameid || p.userId || p.user_id || null,
    name: p.name || p.preferred_username || p.username || p.email || null,
    role: getRoleFromToken(token) || null,
    raw: p,
  };
}

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  else localStorage.removeItem(ACCESS_KEY);
  if (typeof refreshToken !== "undefined") {
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_KEY);
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export default { parseJwt, getRoleFromToken, getUserFromToken, setTokens, getAccessToken, getRefreshToken, clearTokens };
