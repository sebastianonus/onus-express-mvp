import type { Session } from '@supabase/supabase-js';

const MENSAJERO_SESSION_STARTED_AT_KEY = 'mensajero_session_started_at';
const MAX_SESSION_MS = 24 * 60 * 60 * 1000;

const toMs = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getStoredStartMs = (): number | null => {
  if (typeof window === 'undefined') return null;
  return toMs(window.localStorage.getItem(MENSAJERO_SESSION_STARTED_AT_KEY));
};

const setStoredStartMs = (ms: number) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MENSAJERO_SESSION_STARTED_AT_KEY, new Date(ms).toISOString());
};

export const clearMensajeroSessionWindow = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MENSAJERO_SESSION_STARTED_AT_KEY);
};

export const ensureMensajeroSessionWindow = (session: Session): number => {
  const stored = getStoredStartMs();
  if (stored) return stored;

  const fromSession =
    toMs(session.user.last_sign_in_at) ??
    toMs(session.user.created_at) ??
    Date.now();

  setStoredStartMs(fromSession);
  return fromSession;
};

export const isMensajeroSessionExpired = (session: Session): boolean => {
  const startMs = ensureMensajeroSessionWindow(session);
  return Date.now() - startMs > MAX_SESSION_MS;
};
