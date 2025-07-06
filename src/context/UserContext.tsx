// context/UserContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAutoUserCreation, type UseAutoUserCreationReturn } from '../hooks/useAutoUserCreation';
import { UserResponse } from '../services/userService';

interface UserContextType extends UseAutoUserCreationReturn {
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const userCreation = useAutoUserCreation();
  
  const contextValue: UserContextType = {
    ...userCreation,
    isAuthenticated: !!userCreation.user && !userCreation.error,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Hook personalizado para obtener solo los datos del usuario
export function useUserData(): UserResponse | null {
  const { user } = useUser();
  return user;
}

// Hook personalizado para verificar si está autenticado
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useUser();
  return isAuthenticated;
}
