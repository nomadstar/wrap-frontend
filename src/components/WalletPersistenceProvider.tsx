'use client';
import { useWalletPersistence } from '../hooks/useWalletPersistence';
import { useEffect } from 'react';

/**
 * Componente que maneja la persistencia global del wallet
 * Debe estar incluido en el layout principal
 */
export default function WalletPersistenceProvider({ children }: { children: React.ReactNode }) {
    const { isConnected, reconnectAttempts } = useWalletPersistence();

    useEffect(() => {
        // Log para debugging
        console.log('Wallet Status:', { 
            isConnected, 
            reconnectAttempts,
            timestamp: new Date().toISOString()
        });
    }, [isConnected, reconnectAttempts]);

    return <>{children}</>;
}
