
import type { DevConfig } from './types';

// CONFIGURAÇÕES DE DESENVOLVIMENTO MAIS SEGURAS
export const DEV_CONFIG: DevConfig = {
  enabled: import.meta.env.DEV && localStorage.getItem('enable_dev_mode') === 'true',
  adminUser: {
    id: 'dev-admin-001',
    email: 'dev@local.test',
    name: 'Dev Admin',
    role: 'admin' as const,
    first_login_completed: true
  }
};
