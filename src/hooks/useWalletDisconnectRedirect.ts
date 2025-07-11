'use client';
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook para manejar redirección solo en desconexión manual
 */
export function useWalletDisconnectRedirect() {
    const { isConnected } = useAccount();
    const { isConnected: reownIsConnected } = useAppKitAccount();
    const router = useRouter();
    const pathname = usePathname();
    const wasConnectedRef = useRef(false);
    const isInitialLoadRef = useRef(true);

    useEffect(() => {
        // Registrar el estado inicial de conexión
        if (isInitialLoadRef.current) {
            wasConnectedRef.current = isConnected && reownIsConnected;
            isInitialLoadRef.current = false;
            return;
        }

        // Si estaba conectado y ahora no está, es una desconexión manual
        if (wasConnectedRef.current && (!isConnected || !reownIsConnected)) {
            console.log('Desconexión manual detectada, redirigiendo a home...');
            
            // Solo redirigir si no estamos ya en la página de inicio
            if (pathname !== '/') {
                router.push('/');
            }
        }

        // Actualizar el estado de referencia
        wasConnectedRef.current = isConnected && reownIsConnected;
    }, [isConnected, reownIsConnected, pathname, router]);

    return {
        isConnected: isConnected && reownIsConnected,
        wasConnected: wasConnectedRef.current
    };
}
