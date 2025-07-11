'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useAccount, useReconnect } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';

/**
 * Hook personalizado para manejar la reconexión automática
 * y evitar desconexiones no deseadas al navegar entre páginas
 */
export function useWalletPersistence() {
    const { isConnected, address, connector } = useAccount();
    const { isConnected: reownIsConnected } = useAppKitAccount();
    const { reconnect, connectors } = useReconnect();
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 3;

    // Función para intentar reconectar
    const attemptReconnect = useCallback(async () => {
        if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.log('Máximo de intentos de reconexión alcanzado');
            return;
        }

        try {
            reconnectAttempts.current++;
            
            // Intentar reconectar con el último conector usado
            const lastConnectorId = localStorage.getItem('lastUsedConnector');
            const lastConnector = connectors.find(c => c.id === lastConnectorId);
            
            if (lastConnector) {
                console.log(`Intentando reconectar con ${lastConnector.name}...`);
                await reconnect({ connectors: [lastConnector] });
            } else if (connectors.length > 0) {
                // Si no hay conector guardado, usar el primero disponible
                await reconnect({ connectors: [connectors[0]] });
            }
        } catch (error) {
            console.log('Error en reconexión automática:', error);
        }
    }, [reconnect, connectors]);

    // Guardar el conector usado para reconexión futura
    useEffect(() => {
        if (isConnected && address && connector) {
            localStorage.setItem('lastUsedConnector', connector.id);
            localStorage.setItem('lastConnectedAddress', address);
            localStorage.setItem('walletConnected', 'true');
            reconnectAttempts.current = 0; // Reset contador al conectar exitosamente
            console.log(`Wallet conectado: ${connector.name} - ${address}`);
        }
    }, [isConnected, address, connector]);

    // Intentar reconectar al cargar la página si había una conexión previa
    useEffect(() => {
        const wasConnected = localStorage.getItem('walletConnected');
        const lastAddress = localStorage.getItem('lastConnectedAddress');
        
        // Si no estamos conectados pero había una conexión previa, intentar reconectar
        if (!isConnected && !reownIsConnected && wasConnected && lastAddress) {
            console.log('Detectada conexión previa, intentando reconectar...');
            const timer = setTimeout(() => {
                attemptReconnect();
            }, 500); // Reducir el tiempo de espera

            return () => clearTimeout(timer);
        }
    }, [isConnected, reownIsConnected, attemptReconnect]);

    // Limpiar datos solo en desconexión manual
    useEffect(() => {
        if (!isConnected && !reownIsConnected) {
            // Esperar un poco antes de limpiar por si es una desconexión temporal
            const timer = setTimeout(() => {
                if (!isConnected && !reownIsConnected) {
                    const wasConnected = localStorage.getItem('walletConnected');
                    if (wasConnected && reconnectAttempts.current >= maxReconnectAttempts) {
                        console.log('Limpiando datos de conexión después de fallos repetidos');
                        localStorage.removeItem('lastUsedConnector');
                        localStorage.removeItem('lastConnectedAddress');
                        localStorage.removeItem('walletConnected');
                        reconnectAttempts.current = 0;
                    }
                }
            }, 3000); // 3 segundos de gracia

            return () => clearTimeout(timer);
        }
    }, [isConnected, reownIsConnected]);

    return {
        isConnected: isConnected && reownIsConnected,
        address,
        attemptReconnect,
        reconnectAttempts: reconnectAttempts.current
    };
}
