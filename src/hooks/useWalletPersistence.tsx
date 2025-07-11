'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface UseWalletPersistenceReturn {
    storedAddress: string | null;
    isWalletPersisted: boolean;
    clearWalletBuffer: () => void;
    refreshWalletBuffer: () => void;
}

const WALLET_BUFFER_KEY = 'wrapsell_wallet_buffer';
const LAST_CONNECTION_KEY = 'wrapsell_last_connection';
const BUFFER_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutos

export const useWalletPersistence = (): UseWalletPersistenceReturn => {
    const { address, isConnected } = useAccount();
    const [storedAddress, setStoredAddress] = useState<string | null>(null);
    const [isWalletPersisted, setIsWalletPersisted] = useState(false);

    // Función para limpiar el buffer de la wallet
    const clearWalletBuffer = useCallback(() => {
        localStorage.removeItem(WALLET_BUFFER_KEY);
        localStorage.removeItem(LAST_CONNECTION_KEY);
        setStoredAddress(null);
        setIsWalletPersisted(false);
        console.log('Wallet buffer cleared');
    }, []);

    // Función para refrescar el buffer de la wallet
    const refreshWalletBuffer = useCallback(() => {
        if (isConnected && address) {
            localStorage.setItem(WALLET_BUFFER_KEY, address);
            localStorage.setItem(LAST_CONNECTION_KEY, Date.now().toString());
            setStoredAddress(address);
            setIsWalletPersisted(true);
            console.log('Wallet buffer refreshed:', address);
        }
    }, [isConnected, address]);

    // Cargar buffer al inicializar
    useEffect(() => {
        const loadWalletBuffer = () => {
            const stored = localStorage.getItem(WALLET_BUFFER_KEY);
            const storedTime = localStorage.getItem(LAST_CONNECTION_KEY);
            
            if (stored && storedTime) {
                const timeDiff = Date.now() - parseInt(storedTime);
                
                if (timeDiff < BUFFER_EXPIRY_TIME) {
                    setStoredAddress(stored);
                    setIsWalletPersisted(true);
                    console.log('Wallet buffer loaded:', stored);
                } else {
                    // Buffer expirado, limpiarlo
                    clearWalletBuffer();
                }
            }
        };

        loadWalletBuffer();
    }, [clearWalletBuffer]);

    // Actualizar buffer cuando la wallet se conecte
    useEffect(() => {
        if (isConnected && address) {
            refreshWalletBuffer();
        }
    }, [isConnected, address, refreshWalletBuffer]);

    // Limpiar buffer cuando la ventana se cierre (opcional)
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Solo limpiar si no hay conexión activa
            if (!isConnected) {
                clearWalletBuffer();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isConnected, clearWalletBuffer]);

    return {
        storedAddress,
        isWalletPersisted,
        clearWalletBuffer,
        refreshWalletBuffer,
    };
};

export default useWalletPersistence;
