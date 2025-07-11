'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';

interface WalletGuardProps {
    children: React.ReactNode;
}

const WalletGuard: React.FC<WalletGuardProps> = ({ children }) => {
    const { isConnected, isConnecting, isReconnecting, address } = useAccount();
    const { connectors } = useConnect();
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

            if (!isConnected && hasBeenConnectedRef.current) {
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
            } else if (isConnected) {
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
    }, [isConnected, isConnecting, isReconnecting, pathname, router]);

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
    if (!isConnected && pathname !== '/' && shouldRedirect && !isConnecting && !isReconnecting) {
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
