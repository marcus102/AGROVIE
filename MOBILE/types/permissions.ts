// Permission constants for granular access control
export const PERMISSIONS = {
  // System-level permissions
  SYSTEM: {
    FULL_ACCESS: 'system.full_access',
    CONFIG: 'system.config',
    AUDIT: 'system.audit',
  },

  // User management permissions
  USERS: {
    CREATE: 'users.create',
    READ: 'users.read',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE: 'users.manage',
  },

  // Job posting permissions
  JOBS: {
    CREATE_ANY: 'jobs.create.any',
    CREATE_TECHNICIAN: 'jobs.create.technician',
    CREATE_WORKER: 'jobs.create.worker',
    READ: 'jobs.read',
    UPDATE_OWN: 'jobs.update.own',
    DELETE_OWN: 'jobs.delete.own',
    MANAGE_ANY: 'jobs.manage.any',
  },

  // Application permissions
  APPLICATIONS: {
    CREATE: 'applications.create',
    READ_OWN: 'applications.read.own',
    READ_ANY: 'applications.read.any',
    UPDATE_OWN: 'applications.update.own',
    UPDATE_ANY: 'applications.update.any',
    DELETE_OWN: 'applications.delete.own',
  },

  // Selection system permissions
  SELECTION: {
    ACCESS: 'selection.access',
    CONFIGURE: 'selection.configure',
    VIEW_RESULTS: 'selection.view_results',
  },

  // Profile permissions
  PROFILE: {
    READ_OWN: 'profile.read.own',
    READ_ANY: 'profile.read.any',
    UPDATE_OWN: 'profile.update.own',
    UPDATE_ANY: 'profile.update.any',
  },
} as const;