
import React from 'react';
import { useUser } from './UserContext';

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  permission, 
  children, 
  fallback = <div className="text-gray-500 text-center py-4">Acesso negado</div> 
}) => {
  const { hasPermission } = useUser();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
