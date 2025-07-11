'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook que maneja la redirección automática cuando se desconecta la wallet
 * Solo redirige a "/" cuando la wallet se desconecta y no estamos ya en "/"
 */
export const useWalletRedirect = () => {
    const { isConnected } = useAccount();
    const { isConnected: reownIsConnected } = useAppKitAccount();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Solo redirigir si no estamos en "/" y no hay wallet conectada
        if (pathname !== '/' && !isConnected && !reownIsConnected) {
            console.log('Wallet disconnected, redirecting to home...');
            router.push('/');
        }
    }, [isConnected, reownIsConnected, pathname, router]);

    return {
        isWalletConnected: isConnected && reownIsConnected,
        redirectToHome: () => router.push('/'),
    };
};
