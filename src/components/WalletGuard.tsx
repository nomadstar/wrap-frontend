'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';

interface WalletGuardProps {
    children: React.ReactNode;
}

const WalletGuard: React.FC<WalletGuardProps> = ({ children }) => {
    const { isConnected } = useAccount();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Solo redirigir si no estamos en la página principal y no hay wallet conectada
        if (!isConnected && pathname !== '/') {
            console.log('Wallet disconnected, redirecting to home...');
            router.push('/');
        }
    }, [isConnected, pathname, router]);

    // Si no estamos en la página principal y no hay wallet, mostrar loading mientras redirige
    if (!isConnected && pathname !== '/') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to wallet connection...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default WalletGuard;
