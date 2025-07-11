'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';

interface WalletGuardProps {
    children: React.ReactNode;
}

const WalletGuard: React.FC<WalletGuardProps> = ({ children }) => {
    const { isConnected } = useAccount();
    const router = useRouter();
    const pathname = usePathname();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasBeenConnectedRef = useRef(false);

    // Marcar que la wallet ha estado conectada al menos una vez
    useEffect(() => {
        if (isConnected) {
            hasBeenConnectedRef.current = true;
        }
    }, [isConnected]);

    useEffect(() => {
        // Limpiar timeout anterior si existe
        if (disconnectTimeoutRef.current) {
            clearTimeout(disconnectTimeoutRef.current);
            disconnectTimeoutRef.current = null;
        }

        // Solo manejar redirección si no estamos en la página principal
        if (pathname !== '/') {
            if (!isConnected && hasBeenConnectedRef.current) {
                // Dar un delay de 2 segundos antes de redirigir para permitir reconexiones automáticas
                disconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Wallet disconnected for more than 2 seconds, redirecting to home...');
                    setShouldRedirect(true);
                    router.push('/');
                }, 2000);
            } else if (isConnected) {
                // Si se reconecta, cancelar la redirección
                setShouldRedirect(false);
            }
        }

        // Cleanup del timeout al desmontar o cambiar dependencias
        return () => {
            if (disconnectTimeoutRef.current) {
                clearTimeout(disconnectTimeoutRef.current);
                disconnectTimeoutRef.current = null;
            }
        };
    }, [isConnected, pathname, router]);

    // Si no estamos en la página principal y no hay wallet conectada después del delay
    if (!isConnected && pathname !== '/' && shouldRedirect) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Wallet disconnected. Redirecting to connection page...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default WalletGuard;
