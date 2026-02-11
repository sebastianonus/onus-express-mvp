import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoginRoute, type UserRole } from '../utils/auth';
import { supabase } from '../supabase';

export function useRequireRole(requiredRole: UserRole): void {
  const navigate = useNavigate();

  useEffect(() => {
    // Admin keeps PIN-based access flow in this MVP.
    if (requiredRole === 'admin') return;

    let cancelled = false;
    const loginRoute = getLoginRoute(requiredRole);

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const role = data.session?.user?.app_metadata?.role as UserRole | undefined;

        if (!cancelled && role !== requiredRole) {
          navigate(loginRoute, { replace: true });
        }
      } catch {
        if (!cancelled) {
          navigate(loginRoute, { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requiredRole, navigate]);
}
