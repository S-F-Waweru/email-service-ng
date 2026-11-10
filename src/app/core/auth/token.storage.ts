// The token is kept in localStorage so it survives reloads and new tabs.
// The backend has no refresh tokens: when it expires the user logs in again.

const KEY = 'auth-session';

export interface StoredToken {
  accessToken: string;
  /** Epoch ms. */
  expiresAt: number;
}

export function readToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const token = JSON.parse(raw) as StoredToken;
    if (typeof token?.accessToken !== 'string' || typeof token.expiresAt !== 'number') return null;
    return token.expiresAt > Date.now() ? token : (clearToken(), null);
  } catch {
    return null;
  }
}

export function writeToken(token: StoredToken): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(token));
  } catch {
    // Storage blocked: the session lasts until reload.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
