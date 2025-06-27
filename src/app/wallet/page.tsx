
'use client';
import React, { useEffect, useState } from 'react';


type Wallet = {
    id: string;
    name: string;
    address: string;
};

const mockDetectWallets = async (): Promise<Wallet[]> => {
    // Simulación: reemplaza esto con la detección real de wallets
    return [
        // { id: '1', name: 'MetaMask', address: '0x123...' },
        // { id: '2', name: 'WalletConnect', address: '0xabc...' },
    ];
};

export default function WalletPage() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

    useEffect(() => {
        mockDetectWallets().then(setWallets);
    }, []);

    const handleSelect = (wallet: Wallet) => {
        setSelectedWallet(wallet);
        // Aquí puedes agregar la lógica para vincular la wallet seleccionada
    };

    if (wallets.length === 1) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Wallet detectada</h1>
                <div className="p-4 border rounded">
                    <p><strong>{wallets[0].name}</strong></p>
                    <p>{wallets[0].address}</p>
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => handleSelect(wallets[0])}
                >
                    Vincular esta wallet
                </button>
            </div>
        );
    }

    if (wallets.length === 0 || wallets.length > 1) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">
                    {wallets.length === 0 ? 'No se detectaron wallets' : 'Selecciona una wallet para vincular'}
                </h1>
                {wallets.length > 1 && (
                    <ul className="mb-4">
                        {wallets.map(wallet => (
                            <li key={wallet.id} className="mb-2">
                                <button
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                    onClick={() => handleSelect(wallet)}
                                >
                                    {wallet.name} ({wallet.address})
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {wallets.length === 0 && (
                    <p>Por favor, instala o conecta una wallet compatible.</p>
                )}
                {selectedWallet && (
                    <div className="mt-4 p-4 border rounded">
                        <p>Wallet seleccionada: <strong>{selectedWallet.name}</strong></p>
                        <p>{selectedWallet.address}</p>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Cargando wallets...</h1>
            <p>Por favor, espera mientras se detectan las wallets disponibles.</p>
        </div>
    );
}
