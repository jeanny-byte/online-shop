import { useAuth } from '@/context/AuthContext';

/**
 * Hook to check user roles and permissions
 * @returns Object with role check functions
 */
export function useRoles() {
  const { user, isAdmin, isDriver } = useAuth();

  /**
   * Check if the current user has any of the specified roles
   * @param roles Array of roles to check (e.g., ['admin', 'driver'])
   * @returns boolean indicating if the user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    
    const userRoles: string[] = [];
    if (isAdmin) userRoles.push('admin');
    if (isDriver) userRoles.push('driver');
    
    return roles.some(role => userRoles.includes(role));
  };

  /**
   * Check if the current user has all of the specified roles
   * @param roles Array of roles to check
   * @returns boolean indicating if the user has all of the specified roles
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!user) return false;
    
    const userRoles: string[] = [];
    if (isAdmin) userRoles.push('admin');
    if (isDriver) userRoles.push('driver');
    
    return roles.every(role => userRoles.includes(role));
  };

  return {
    isAdmin,
    isDriver,
    hasAnyRole,
    hasAllRoles,
  };
}
