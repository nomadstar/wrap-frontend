'use client';

import { useEffect, useRef } from 'react';
import { useAccount, useConnect } from 'wagmi';

// Hook personalizado para mantener la conexión de wallet
export const useWalletPersistence = () => {
  const { isConnected, isConnecting, isReconnecting, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpiar timeout anterior
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Si está conectado, resetear contador de intentos
    if (isConnected) {
      reconnectAttempts.current = 0;
      return;
    }

    // Si está conectando o reconectando, no hacer nada
    if (isConnecting || isReconnecting) {
      return;
    }

    // Si no está conectado y había un conector anterior, intentar reconectar
    if (!isConnected && connector && reconnectAttempts.current < maxReconnectAttempts) {
      console.log(`Attempting wallet reconnection ${reconnectAttempts.current + 1}/${maxReconnectAttempts}`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        
        try {
          // Intentar reconectar con el último conector usado
          connect({ connector });
        } catch (error) {
          console.error('Failed to reconnect wallet:', error);
        }
      }, 1000 * reconnectAttempts.current); // Incrementar delay con cada intento
    }

    // Cleanup al desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [isConnected, isConnecting, isReconnecting, connector, connect]);

  return {
    isConnected,
    isConnecting,
    isReconnecting,
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts,
  };
};
