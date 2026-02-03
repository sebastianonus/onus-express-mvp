/**
 * MÓDULO DE AUTORIZACIÓN - PLACEHOLDER PARA INTEGRACIÓN FUTURA
 * 
 * Este archivo define la interfaz de autenticación y autorización
 * pero NO implementa ninguna lógica real.
 * 
 * IMPORTANTE: Este es solo un contrato de tipos y funciones vacías.
 * La implementación real vendrá de:
 * - Supabase Auth (sesiones, tokens, usuarios)
 * - Edge Functions (validación de roles, permisos)
 * 
 * NO CONTIENE:
 * - Almacenamiento local
 * - Stubs o mocks
 * - Lógica de autenticación simulada
 * - Datos de prueba
 * 
 * CONTIENE SOLO:
 * - Tipos TypeScript
 * - Funciones placeholder que retornan null/false
 * - Documentación de la integración futura
 */

// ============================================================================
// TIPOS Y CONTRATOS
// ============================================================================

/**
 * Roles válidos del sistema
 * Estos roles se asignarán en Supabase Auth vía app_metadata.role
 */
export type UserRole = 'mensajero' | 'cliente' | 'admin';

/**
 * Interfaz de usuario autenticado
 * Representa los datos que vendrán de Supabase Auth
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

// ============================================================================
// PLACEHOLDERS DE FUNCIONES - SIN IMPLEMENTACIÓN REAL
// ============================================================================

/**
 * PLACEHOLDER: Obtener rol del usuario actual
 * 
 * ESTADO ACTUAL: Retorna null siempre (no hay autenticación real)
 * 
 * INTEGRACIÓN FUTURA:
 * ```typescript
 * export async function getCurrentRole(): Promise<UserRole | null> {
 *   const { data: { session } } = await supabase.auth.getSession();
 *   if (!session?.user) return null;
 *   return session.user.app_metadata?.role as UserRole || null;
 * }
 * ```
 */
export function getCurrentRole(): UserRole | null {
  // PLACEHOLDER: No hay autenticación real
  // Retornar null hasta que se integre Supabase Auth
  return null;
}

/**
 * PLACEHOLDER: Obtener usuario completo
 * 
 * ESTADO ACTUAL: Retorna null siempre
 * 
 * INTEGRACIÓN FUTURA:
 * ```typescript
 * export async function getCurrentUser(): Promise<AuthUser | null> {
 *   const { data: { session } } = await supabase.auth.getSession();
 *   if (!session?.user) return null;
 *   return {
 *     id: session.user.id,
 *     email: session.user.email!,
 *     role: session.user.app_metadata?.role as UserRole
 *   };
 * }
 * ```
 */
export function getCurrentUser(): AuthUser | null {
  // PLACEHOLDER: No hay autenticación real
  return null;
}

/**
 * PLACEHOLDER: Verificar si hay sesión activa
 * 
 * ESTADO ACTUAL: Retorna false siempre
 * 
 * INTEGRACIÓN FUTURA:
 * ```typescript
 * export async function isAuthenticated(): Promise<boolean> {
 *   const { data: { session } } = await supabase.auth.getSession();
 *   return !!session;
 * }
 * ```
 */
export function isAuthenticated(): boolean {
  // PLACEHOLDER: No hay autenticación real
  return false;
}

/**
 * PLACEHOLDER: Verificar si el usuario tiene un rol específico
 * 
 * ESTADO ACTUAL: Retorna false siempre
 * 
 * INTEGRACIÓN FUTURA: Esta función se adaptará automáticamente
 * cuando getCurrentRole() retorne datos reales de Supabase
 */
export function hasRole(requiredRole: UserRole): boolean {
  const currentRole = getCurrentRole();
  return currentRole === requiredRole;
}

// ============================================================================
// UTILIDADES DE RUTAS (No requieren cambios en integración)
// ============================================================================

/**
 * Obtener la ruta de login según el rol
 * Esta función es puramente de navegación, no requiere backend
 */
export function getLoginRoute(role: UserRole): string {
  if (role === 'mensajero') return '/mensajeros/acceso';
  if (role === 'admin') return '/admin';
  return '/clientes';
}

/**
 * Obtener la ruta home según el rol
 * Esta función es puramente de navegación, no requiere backend
 */
export function getHomeRoute(role: UserRole): string {
  if (role === 'mensajero') return '/mensajeros';
  if (role === 'admin') return '/admin';
  return '/clientes';
}

/**
 * PLACEHOLDER: Cerrar sesión
 * 
 * ESTADO ACTUAL: Función vacía (no hace nada)
 * 
 * INTEGRACIÓN FUTURA:
 * ```typescript
 * export async function logout(): Promise<void> {
 *   await supabase.auth.signOut();
 * }
 * ```
 */
export function logout(): void {
  // PLACEHOLDER: No hay sesión que cerrar
  // Esta función se implementará con Supabase Auth
}
