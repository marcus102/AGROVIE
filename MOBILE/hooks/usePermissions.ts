import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/types/permissions';
import { RoleType } from '@/types/roles';

export function usePermissions() {
  const { 
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreateJob,
    user
  } = useAuthStore();

  const canManageUsers = () => hasPermission(PERMISSIONS.USERS.MANAGE);
  
  const canAccessSelectionSystem = () => 
    hasAnyPermission([PERMISSIONS.SELECTION.ACCESS, PERMISSIONS.SELECTION.CONFIGURE]);
  
  const canViewApplications = () =>
    hasAnyPermission([PERMISSIONS.APPLICATIONS.READ_OWN, PERMISSIONS.APPLICATIONS.READ_ANY]);
  
  const canManageOwnApplications = () =>
    hasAllPermissions([
      PERMISSIONS.APPLICATIONS.READ_OWN,
      PERMISSIONS.APPLICATIONS.UPDATE_OWN,
      PERMISSIONS.APPLICATIONS.DELETE_OWN,
    ]);

  const canPostJob = (targetRole: RoleType) => canCreateJob(targetRole);

  const isAdmin = () => user?.role === 'admin';
  
  const isEntrepreneur = () => user?.role === 'entrepreneur';
  
  const isTechnician = () => user?.role === 'technician';
  
  const isWorker = () => user?.role === 'worker';

  return {
    canManageUsers,
    canAccessSelectionSystem,
    canViewApplications,
    canManageOwnApplications,
    canPostJob,
    isAdmin,
    isEntrepreneur,
    isTechnician,
    isWorker,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}