'use client';

import React from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { Wallet, User, LogOut } from 'lucide-react';

interface WalletConnectButtonProps {
    className?: string;
    showAddress?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
    className = '',
    showAddress = false,
    variant = 'primary',
    size = 'md'
}) => {
    const { open } = useAppKit();
    const { isConnected, address } = useAccount();

    const getButtonStyles = () => {
        const baseStyles = 'flex items-center justify-center space-x-2 font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200';

        const sizeStyles = {
            sm: 'py-2 px-4 text-sm',
            md: 'py-3 px-6 text-base',
            lg: 'py-4 px-8 text-lg'
        };

        const variantStyles = {
            primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white',
            secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white',
            outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-white'
        };

        return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
    };

    const handleClick = () => {
        open();
    };

    if (isConnected && showAddress) {
        return (
            <button
                onClick={handleClick}
                className={getButtonStyles()}
            >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                </span>
                <span className="sm:hidden">Wallet</span>
            </button>
        );
    }

    if (isConnected) {
        return (
            <button
                onClick={handleClick}
                className={getButtonStyles()}
            >
                <User className="w-5 h-5" />
                <span>Manage Wallet</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={getButtonStyles()}
        >
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
        </button>
    );
};

export default WalletConnectButton;
