
'use client';

import React from 'react';
import AnimatedBackground from './background';
export default function LoadingWallet() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            position: 'relative',
            zIndex: 0
        }}>
            <AnimatedBackground />
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(255,255,255,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                flexDirection: 'column'
            }}>
                <div style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        display: 'inline-block',
                        width: '48px',
                        height: '48px',
                        border: '6px solid #ccc',
                        borderTop: '6px solid #0070f3',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <style>
                        {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        `}
                    </style>
                </div>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#333',
                    textAlign: 'center'
                }}>
                    Loading wallet please wait
                </div>
            </div>
        </div>
    );
}