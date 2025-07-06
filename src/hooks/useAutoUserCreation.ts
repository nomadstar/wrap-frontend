// hooks/useAutoUserCreation.ts
"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { UserService, type UserResponse } from '../services/userService';

export interface UseAutoUserCreationReturn {
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAutoUserCreation(): UseAutoUserCreationReturn {
  const { address, isConnected, connector } = useAccount();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrFetchUser = async () => {
    if (!address || !isConnected) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determinar el tipo de wallet
      const walletType = connector?.name || 'ethereum';
      
      // Crear usuario si no existe o obtener el existente
      const userData = await UserService.createUserIfNotExists(address, walletType);
      setUser(userData);
      
      console.log('Usuario autenticado:', userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en auto-creación de usuario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para ejecutar cuando cambie la conexión de wallet
  useEffect(() => {
    createOrFetchUser();
  }, [address, isConnected, connector]);

  // Función para refetch manual
  const refetch = async () => {
    await createOrFetchUser();
  };

  return {
    user,
    isLoading,
    error,
    refetch,
  };
}
