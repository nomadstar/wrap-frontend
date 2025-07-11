import { useAccount } from 'wagmi';
import React from 'react';

const Navbar: React.FC = () => {
    const { isConnected: isLoggedIn } = useAccount();
    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            background: 'linear-gradient(90deg,rgb(197, 52, 219) 0%,rgb(68, 101, 173) 100%)',
            color: '#fff'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                <img src="/assets/Simbol.png" alt="Logo" style={{ height: '2rem', marginRight: '0.75rem' }} />
                WrapSell
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <ul style={{
                    listStyle: 'none',
                    display: 'flex',
                    gap: '1.5rem',
                    margin: 0,
                    padding: 0
                }}>
                    <li>
                        <a
                            href="/"
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.color = '#c084fc'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.color = '#fff'}
                        >
                            Home
                        </a>
                    </li>
                    {isLoggedIn && (
                        <>
                            <li>
                                <a
                                    href="/dashboard"
                                    style={{
                                        color: '#fff',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s',
                                        fontWeight: '500'
                                    }}
                                    onMouseOver={(e) => (e.target as HTMLElement).style.color = '#c084fc'}
                                    onMouseOut={(e) => (e.target as HTMLElement).style.color = '#fff'}
                                >
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/mypools"
                                    style={{
                                        color: '#fff',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s',
                                        fontWeight: '500'
                                    }}
                                    onMouseOver={(e) => (e.target as HTMLElement).style.color = '#c084fc'}
                                    onMouseOut={(e) => (e.target as HTMLElement).style.color = '#fff'}
                                >
                                    My Pools
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/wallet"
                                    style={{
                                        color: '#fff',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s',
                                        fontWeight: '500'
                                    }}
                                    onMouseOver={(e) => (e.target as HTMLElement).style.color = '#c084fc'}
                                    onMouseOut={(e) => (e.target as HTMLElement).style.color = '#fff'}
                                >
                                    Wallet
                                </a>
                            </li>
                        </>
                    )}
                </ul>

                {/* Botón oficial de Reown AppKit */}
                <w3m-button />
            </div>
        </nav>
    );
};

export default Navbar;