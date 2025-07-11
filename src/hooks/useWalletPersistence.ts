'use client';

import { useEffect, useRef } from 'react';
import { useAccount, useConnect } from 'wagmi';

// Hook personalizado para mantener la conexión de wallet
export const useWalletPersistence = () => {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
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

    // Si no está conectado y hay conectores disponibles, intentar reconectar
    if (!isConnected && connectors.length > 0 && reconnectAttempts.current < maxReconnectAttempts) {
      console.log(`Attempting wallet reconnection ${reconnectAttempts.current + 1}/${maxReconnectAttempts}`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        
        try {
          // Intentar reconectar con el primer conector disponible
          const firstConnector = connectors[0];
          if (firstConnector) {
            connect({ connector: firstConnector });
          }
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
  }, [isConnected, isConnecting, isReconnecting, connectors, connect]);

  return {
    isConnected,
    isConnecting,
    isReconnecting,
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts,
  };
};
