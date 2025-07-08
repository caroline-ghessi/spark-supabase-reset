
import type { DevConfig } from './types';

// SECURITY: Development mode completely removed for production security
export const DEV_CONFIG: DevConfig = {
  enabled: false, // Always disabled for security
  adminUser: {
    id: '',
    email: '',
    name: '',
    role: 'admin' as const,
    first_login_completed: false
  }
};
