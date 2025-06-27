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
            <ul style={{
                listStyle: 'none',
                display: 'flex',
                gap: '1.5rem',
                margin: 0,
                padding: 0
            }}>
                {isLoggedIn ? (
                    <>
                        <li><w3m-button /></li>
                        <li><w3m-network-button /></li>
                    </>
                ) : (
                    <li><w3m-button /></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;