
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockUsers, accessLevels, type User } from '@/data/usersData';

interface UserContextType {
  currentUser: User | null;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  users: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Simular usuário logado (Carol - Admin)
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    const userLevel = accessLevels[currentUser.nivel];
    return userLevel?.permissoes.includes(permission) || false;
  };

  const login = (email: string, password: string): boolean => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      hasPermission,
      login,
      logout,
      users: mockUsers
    }}>
      {children}
    </UserContext.Provider>
  );
};
