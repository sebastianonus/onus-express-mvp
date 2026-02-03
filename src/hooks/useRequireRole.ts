/**
 * HOOK: useRequireRole - PLACEHOLDER PARA INTEGRACIÓN FUTURA
 * 
 * Este hook marca qué componentes requieren ciertos roles,
 * pero NO implementa validación real.
 * 
 * ESTADO ACTUAL: Solo documentación visual
 * - No bloquea acceso
 * - No redirige
 * - No valida roles
 * 
 * INTEGRACIÓN FUTURA:
 * Cuando se conecte Supabase Auth, este hook:
 * 1. Leerá la sesión real de Supabase
 * 2. Validará el rol contra app_metadata.role
 * 3. Redirigirá si no coincide
 * 
 * USO ACTUAL:
 * ```tsx
 * function MensajerosSesion() {
 *   useRequireRole('mensajero'); // Solo marca la intención
 *   // ... resto del componente
 * }
 * ```
 * 
 * IMPORTANTE: Este hook NO previene acceso. Es solo marcado de intención.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentRole, getLoginRoute, type UserRole } from '../utils/auth';

export function useRequireRole(requiredRole: UserRole): void {
  const navigate = useNavigate();

  useEffect(() => {
    // PLACEHOLDER: En el estado actual, getCurrentRole() siempre retorna null
    // Por lo tanto, este código nunca ejecutará redirecciones reales
    // 
    // Cuando se integre Supabase Auth:
    // - getCurrentRole() retornará el rol real desde session.user.app_metadata.role
    // - Esta lógica funcionará automáticamente sin cambios
    
    const currentRole = getCurrentRole();
    
    if (currentRole !== requiredRole) {
      // FUTURO: Esto redirigirá cuando haya autenticación real
      // AHORA: currentRole es siempre null, así que esto no hace nada útil
      const loginRoute = getLoginRoute(requiredRole);
      
      // Comentado para evitar redirecciones en modo placeholder
      // navigate(loginRoute, { replace: true });
    }
  }, [requiredRole, navigate]);
  
  // NOTA: Este hook actualmente no bloquea nada
  // Los componentes renderizarán libremente hasta que se integre Supabase Auth
}
