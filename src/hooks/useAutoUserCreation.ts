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

    console.log('🚀 Iniciando proceso de autenticación para:', address);
    setIsLoading(true);
    setError(null);

    try {
      // Determinar el tipo de wallet
      const walletType = connector?.name || 'ethereum';
      console.log('💰 Tipo de wallet detectado:', walletType);
      
      // Crear usuario si no existe o obtener el existente
      const userData = await UserService.createUserIfNotExists(address, walletType);
      setUser(userData);
      
      console.log('✅ Usuario autenticado correctamente:', userData);
    } catch (err) {
      console.error('❌ Error en autenticación:', err);
      
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
          errorMessage = 'Error de conexión al servidor. Verifica tu conexión a internet.';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Error de CORS. El servidor no permite conexiones desde este dominio.';
        } else if (err.message.includes('401')) {
          errorMessage = 'Error de autenticación. API key inválida.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('💥 Error detallado en auto-creación de usuario:', {
        error: err,
        address,
        walletType: connector?.name,
        timestamp: new Date().toISOString()
      });
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
