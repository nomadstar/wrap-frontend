'use client';
import React, { useState, useEffect } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAppKitAccount } from '@reown/appkit/react';
import AnimatedBackground from './background';
import Sidebar from '../../components/webcomponents/sidebar';
import Background from '../../components/webcomponents/background';

interface UserData {
    name: string;
    surname: string;
    email: string;
    direction: string;
    connectedWallets: string[];
}

export default function SettingsPage() {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    
    const [userData, setUserData] = useState<UserData>({
        name: '',
        surname: '',
        email: '',
        direction: '',
        connectedWallets: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const MAX_WALLETS = 5;

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (isConnected && address && !userData.connectedWallets.includes(address)) {
            if (userData.connectedWallets.length >= MAX_WALLETS) {
                setError(`Solo puedes conectar un máximo de ${MAX_WALLETS} wallets`);
                return;
            }
            handleAddWallet(address);
        }
    }, [isConnected, address, userData.connectedWallets]);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
        } catch (err) {
            setError('Error al cargar los datos del usuario');
        }
    };

    const handleAddWallet = async (walletAddress: string) => {
        try {
            const res = await fetch('/api/user/wallets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al conectar la wallet');
            }
            
            setUserData(prev => ({
                ...prev,
                connectedWallets: [...prev.connectedWallets, walletAddress]
            }));
            setSuccess('Wallet conectada correctamente');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error al conectar la wallet';
            setError(errorMessage);
        }
    };

    const handleDisconnectWallet = async (walletAddress: string) => {
        try {
            const res = await fetch('/api/user/wallets', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al desconectar la wallet');
            }
            
            setUserData(prev => ({
                ...prev,
                connectedWallets: prev.connectedWallets.filter(wallet => wallet !== walletAddress)
            }));
            setSuccess('Wallet desconectada correctamente');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error al desconectar la wallet';
            setError(errorMessage);
        }
    };

    const handleConnectWallet = () => {
        open();
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    surname: userData.surname,
                    direction: userData.direction
                }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al guardar los datos');
            }
            setSuccess('Datos guardados correctamente');
            setIsEditing(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error al guardar los datos';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 bg-gray-50 relative">
                <AnimatedBackground />
                <div className="flex items-center justify-center min-h-screen p-8">
                    <div style={{
                        background: '#fff',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        minWidth: '500px',
                        maxWidth: '600px',
                        width: '100%',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                            <img src="/assets/Simbol.png" alt="Logo" style={{ marginRight: '0.75rem', height: '50px' }} />
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                                Configuración de Cuenta
                            </h1>
                        </div>

                        {/* Personal Information Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                                Información Personal
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={userData.name}
                                    onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={!isEditing}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor: isEditing ? '#fff' : '#f9f9f9'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    value={userData.surname}
                                    onChange={e => setUserData(prev => ({ ...prev, surname: e.target.value }))}
                                    disabled={!isEditing}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor: isEditing ? '#fff' : '#f9f9f9'
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={userData.email}
                                    disabled
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor: '#f0f0f0'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Dirección"
                                    value={userData.direction}
                                    onChange={e => setUserData(prev => ({ ...prev, direction: e.target.value }))}
                                    disabled={!isEditing}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor: isEditing ? '#fff' : '#f9f9f9'
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            border: 'none',
                                            background: '#0070f3',
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Editar
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: '#28a745',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                border: '1px solid #ccc',
                                                background: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Wallet Connection Section */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                                Wallets Conectadas
                            </h2>
                            
                            {isConnected && address && (
                                <div style={{
                                    padding: '0.75rem',
                                    border: '2px solid #28a745',
                                    borderRadius: '4px',
                                    marginBottom: '1rem',
                                    backgroundColor: '#f8fff8'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>● Conectado:</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                            {address.slice(0, 10)}...{address.slice(-8)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            <div style={{ marginBottom: '1rem' }}>
                                {userData.connectedWallets.map((wallet, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '4px',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                            {wallet.slice(0, 10)}...{wallet.slice(-8)}
                                        </span>
                                        <button
                                            onClick={() => handleDisconnectWallet(wallet)}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: '#dc3545',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Desconectar
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <button
                                onClick={handleConnectWallet}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: '#17a2b8',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                {isConnected ? 'Conectar otra Wallet' : 'Conectar Wallet'}
                            </button>
                        </div>

                        {error && <div style={{ color: '#dc3545', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
                        {success && <div style={{ color: '#28a745', textAlign: 'center', marginBottom: '1rem' }}>{success}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
