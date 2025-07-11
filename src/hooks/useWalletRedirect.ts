'use client';

import { useAccount } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';
import { useRouter } from 'next/navigation';

/**
 * Hook que proporciona utilidades para manejo de wallet sin redirecciones automáticas
 */
export const useWalletRedirect = () => {
    const { isConnected } = useAccount();
    const { isConnected: reownIsConnected } = useAppKitAccount();
    const router = useRouter();

    return {
        isWalletConnected: isConnected && reownIsConnected,
        redirectToHome: () => router.push('/'),
        isConnected,
        reownIsConnected,
    };
};
