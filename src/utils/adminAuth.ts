const ADMIN_SESSION_KEY = 'onus_admin_auth';
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

type AdminSession = {
  loggedAt: number;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function setAdminSession(): void {
  if (!isBrowser()) return;

  const payload: AdminSession = {
    loggedAt: Date.now(),
  };

  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(payload));
}

export function clearAdminSession(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminSessionActive(): boolean {
  if (!isBrowser()) return false;

  const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.loggedAt) return false;
    return Date.now() - parsed.loggedAt < ADMIN_SESSION_TTL_MS;
  } catch {
    return false;
  }
}
