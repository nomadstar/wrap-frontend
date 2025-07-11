'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useAppKit, useAppKitAccount, useAppKitState } from '@reown/appkit/react';
import { useRouter, usePathname } from 'next/navigation';

interface WalletGuardProps {
    children: React.ReactNode;
}

const WalletGuard: React.FC<WalletGuardProps> = ({ children }) => {
    const { isConnected, isConnecting, isReconnecting, address } = useAccount();
    const { connectors } = useConnect();
    const { open } = useAppKit();
    const { isConnected: reownIsConnected, address: reownAddress } = useAppKitAccount();
    const { open: reownModalOpen } = useAppKitState();
    const router = useRouter();
    const pathname = usePathname();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasBeenConnectedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    // Buffer temporal para almacenar la dirección de la wallet
    const walletAddressBufferRef = useRef<string | null>(null);
    const lastConnectionTimeRef = useRef<number>(0);

    // Marcar que la wallet ha estado conectada al menos una vez y guardar en buffer
    useEffect(() => {
        if (isConnected && address) {
            // Verificar si hubo un cambio de wallet desde una página que no es /wallet
            const previousAddress = walletAddressBufferRef.current;
            const isWalletPage = pathname === '/wallet';

            // Si hay una dirección previa diferente y no estamos en /wallet, es un cambio no autorizado
            if (previousAddress && previousAddress !== address && !isWalletPage) {
                console.log('Unauthorized wallet change detected outside /wallet page. Redirecting...');
                // Limpiar buffer y redirigir
                walletAddressBufferRef.current = null;
                localStorage.removeItem('wrapsell_wallet_buffer');
                localStorage.removeItem('wrapsell_last_connection');
                router.push('/');
                return;
            }

            // Si es un cambio autorizado o primera conexión
            hasBeenConnectedRef.current = true;
            walletAddressBufferRef.current = address;
            lastConnectionTimeRef.current = Date.now();
            setShouldRedirect(false);
            setIsLoading(false);

            // Almacenar en localStorage como respaldo
            localStorage.setItem('wrapsell_wallet_buffer', address);
            localStorage.setItem('wrapsell_last_connection', Date.now().toString());

            console.log('Wallet connected and stored in buffer:', address);
        }
    }, [isConnected, address, pathname, router]);

    // Recuperar buffer al cargar la página
    useEffect(() => {
        const storedAddress = localStorage.getItem('wrapsell_wallet_buffer');
        const storedTime = localStorage.getItem('wrapsell_last_connection');

        if (storedAddress && storedTime) {
            const timeDiff = Date.now() - parseInt(storedTime);
            // Si la última conexión fue hace menos de 10 minutos, mantener el buffer
            if (timeDiff < 10 * 60 * 1000) {
                walletAddressBufferRef.current = storedAddress;
                hasBeenConnectedRef.current = true;
                console.log('Wallet buffer recovered from localStorage:', storedAddress);
            } else {
                // Limpiar buffer viejo
                localStorage.removeItem('wrapsell_wallet_buffer');
                localStorage.removeItem('wrapsell_last_connection');
            }
        }
    }, []);

    // Detectar desconexión de Reown y redirigir a /
    useEffect(() => {
        // Si previamente había una conexión pero ahora Reown está desconectado
        if (hasBeenConnectedRef.current && !reownIsConnected && pathname !== '/') {
            console.log('Reown wallet disconnected, redirecting to home...');
            // Limpiar buffer y redirigir
            walletAddressBufferRef.current = null;
            hasBeenConnectedRef.current = false;
            localStorage.removeItem('wrapsell_wallet_buffer');
            localStorage.removeItem('wrapsell_last_connection');
            router.push('/');
        }
    }, [reownIsConnected, pathname, router]);

    useEffect(() => {
        // Limpiar timeout anterior si existe
        if (disconnectTimeoutRef.current) {
            clearTimeout(disconnectTimeoutRef.current);
            disconnectTimeoutRef.current = null;
        }

        // Solo manejar redirección si no estamos en la página principal
        if (pathname !== '/') {
            // Si está conectando o reconectando, no hacer nada
            if (isConnecting || isReconnecting) {
                setIsLoading(true);
                return;
            }

            // Verificar tanto wagmi como Reown
            const isWalletConnected = isConnected && reownIsConnected;

            if (!isWalletConnected && hasBeenConnectedRef.current) {
                // Verificar si tenemos una dirección en el buffer temporal
                const hasWalletInBuffer = walletAddressBufferRef.current !== null;
                const timeSinceLastConnection = Date.now() - lastConnectionTimeRef.current;

                // Solo considerar como desconexión real si:
                // 1. No está conectado
                // 2. No hay dirección en buffer O ha pasado mucho tiempo desde la última conexión
                if (!hasWalletInBuffer || timeSinceLastConnection > 30000) { // 30 segundos
                    console.log('Wallet truly disconnected, starting countdown...');
                    setIsLoading(true);

                    // Dar un delay de 8 segundos antes de redirigir para permitir reconexiones automáticas
                    disconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Wallet disconnected for more than 8 seconds, redirecting to home...');
                        // Limpiar buffer al redirigir
                        walletAddressBufferRef.current = null;
                        localStorage.removeItem('wrapsell_wallet_buffer');
                        localStorage.removeItem('wrapsell_last_connection');
                        setShouldRedirect(true);
                        setIsLoading(false);
                        router.push('/');
                    }, 8000);
                } else {
                    // Hay wallet en buffer, consideramos como conexión temporal
                    console.log('Wallet temporarily disconnected but found in buffer, maintaining session...');
                    setIsLoading(false);
                    setShouldRedirect(false);
                }
            } else if (isWalletConnected) {
                // Si se reconecta, cancelar la redirección
                setShouldRedirect(false);
                setIsLoading(false);
            }
        }

        // Cleanup del timeout al desmontar o cambiar dependencias
        return () => {
            if (disconnectTimeoutRef.current) {
                clearTimeout(disconnectTimeoutRef.current);
                disconnectTimeoutRef.current = null;
            }
        };
    }, [isConnected, reownIsConnected, isConnecting, isReconnecting, pathname, router]);

    // Mostrar loading durante transiciones de conexión
    if ((isConnecting || isReconnecting || isLoading) && pathname !== '/') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {isConnecting ? 'Connecting wallet...' :
                            isReconnecting ? 'Reconnecting wallet...' :
                                'Checking wallet connection...'}
                    </p>
                </div>
            </div>
        );
    }

    // Si no estamos en la página principal y no hay wallet conectada después del delay
    const isWalletConnected = isConnected && reownIsConnected;
    if (!isWalletConnected && pathname !== '/' && shouldRedirect && !isConnecting && !isReconnecting) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md w-full mx-auto p-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
                        <p className="text-gray-600 mb-6">
                            You need to connect your wallet to access this page.
                            Please connect your wallet to continue.
                        </p>
                        <button
                            onClick={() => open()}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Connect Wallet</span>
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default WalletGuard;
