export type JwtPayload = Record<string, unknown>;

function base64UrlDecode(input: string) {
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
  } catch {
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
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): string | null {
  const p = parseJwt(token);
  if (!p) return null;
  return p.role as string | null;
}

export function getUserFromToken(token: string): { id: string | null; name: string | null; role: string | null; raw: JwtPayload } {
  const p = parseJwt(token) || ({} as JwtPayload);
  const id = typeof p["nameid"] === "string" ? (p["nameid"] as string) : null;
  const name = typeof p["unique_name"] === "string" ? (p["unique_name"] as string) : null;
  const role = getRoleFromToken(token) || null;
  return { id, name, role, raw: p };
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
  // notify listeners
  notifyTokenListeners(accessToken, refreshToken ?? null);
}

/**
 * Kiểm tra token JWT đã hết hạn chưa (dựa trên claim `exp`).
 * - Trả về `true` nếu không decode được, không có exp, hoặc exp <= now.
 * - Trả về `false` nếu còn hạn.
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const p = parseJwt(token);
  if (!p) return true;
  const exp = (p as Record<string, unknown>).exp;
  if (typeof exp !== "number") return true;
  // exp là epoch seconds; cho 5s buffer để tránh race với BE
  const nowSec = Math.floor(Date.now() / 1000);
  return exp - 5 <= nowSec;
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) return null;
  // Tự dọn dẹp token hết hạn để tránh UI hiểu nhầm "đã đăng nhập"
  if (isTokenExpired(token)) {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    notifyTokenListeners(null, null);
    return null;
  }
  return token;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  // notify listeners
  notifyTokenListeners(null, null);
}

type TokenListener = (access: string | null, refresh: string | null) => void;
const tokenListeners: TokenListener[] = [];

function notifyTokenListeners(access: string | null, refresh: string | null) {
  tokenListeners.slice().forEach((cb) => cb(access, refresh));
}

export function addTokenListener(cb: TokenListener) {
  tokenListeners.push(cb);
  return () => {
    const idx = tokenListeners.indexOf(cb);
    if (idx >= 0) tokenListeners.splice(idx, 1);
  };
}

export default { parseJwt, getRoleFromToken, getUserFromToken, setTokens, getAccessToken, getRefreshToken, clearTokens, isTokenExpired };
