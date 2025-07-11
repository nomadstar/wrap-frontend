'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Wallet, 
    TrendingUp, 
    DollarSign,
    Zap,
    Users,
    Calendar,
    Grid3X3,
    ChevronDown,
    ArrowLeft
} from 'lucide-react';
import { useWalletPersistence } from '@/hooks/useWalletPersistence';

const Dashboard = () => {
    const router = useRouter();
    const { isConnected } = useWalletPersistence();
    const [userInvestment] = useState(1250.00);
    const [showPoolsMenu, setShowPoolsMenu] = useState(false);
    const [selectedPool, setSelectedPool] = useState('fury-cards');

    const formatNumber = (num: number) => {
        // Usar un formato consistente para evitar problemas de hidratación
        return new Intl.NumberFormat('en-US').format(num);
    }

    const pools = [
        {
            id: 'fury-cards',
            name: 'Fury Cards Pool',
            description: 'Pokemon TCG Investment Pool',
            value: 8647.52,
            investors: 47,
            gradient: 'from-orange-500 to-red-600',
            icon: Zap
        },
        {
            id: 'crystal-vault',
            name: 'Crystal Vault Pool',
            description: 'Yu-Gi-Oh! Premium Cards',
            value: 12430.18,
            investors: 63,
            gradient: 'from-blue-500 to-purple-600',
            icon: Grid3X3
        },
        {
            id: 'legends-collection',
            name: 'Legends Collection',
            description: 'Magic: The Gathering Vintage',
            value: 15892.74,
            investors: 34,
            gradient: 'from-green-500 to-teal-600',
            icon: TrendingUp
        },
        {
            id: 'sports-elite',
            name: 'Sports Elite Pool',
            description: 'Premium Sports Cards',
            value: 9234.67,
            investors: 52,
            gradient: 'from-red-500 to-pink-600',
            icon: Users
        }
    ];

    const currentPool = pools.find(pool => pool.id === selectedPool);

    const handlePoolSelect = (poolId: string) => {
        setSelectedPool(poolId);
        setShowPoolsMenu(false);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md w-full">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Wallet Disconnected</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6">Please connect your wallet to continue.</p>
                    <p className="text-xs text-gray-500">Use the wallet button in the navigation bar to connect.</p>
                </div>
            </div>
        );
    }

    if (showPoolsMenu) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <button
                            onClick={() => setShowPoolsMenu(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">All Pools</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pools.map((pool) => {
                            const IconComponent = pool.icon;
                            return (
                                <div
                                    key={pool.id}
                                    onClick={() => handlePoolSelect(pool.id)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all"
                                >
                                    <div className={`bg-gradient-to-r ${pool.gradient} p-4 rounded-t-xl text-white`}>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <IconComponent className="w-6 h-6" />
                                            <h3 className="font-bold text-lg">{pool.name}</h3>
                                        </div>
                                        <p className="text-white/80 text-sm">{pool.description}</p>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 text-sm">Pool Value</span>
                                            <span className="font-semibold">${formatNumber(pool.value)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm">Investors</span>
                                            <span className="font-medium">{pool.investors}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Pool Header */}
                <div className={`bg-gradient-to-r ${currentPool?.gradient} rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            {currentPool?.icon && <currentPool.icon className="w-6 h-6 sm:w-8 sm:h-8" />}
                            <h2 className="text-xl sm:text-2xl font-bold">{currentPool?.name}</h2>
                        </div>
                        <button
                            onClick={() => setShowPoolsMenu(true)}
                            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                        >
                            <Grid3X3 className="w-4 h-4" />
                            <span className="text-sm">All Pools</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-white/80 text-sm sm:text-base">{currentPool?.description}</p>
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Pool Value</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">${formatNumber(currentPool?.value || 0)}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Your Investment</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">${formatNumber(userInvestment)}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Investors</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentPool?.investors || 0}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Days Active</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">127</p>
                    </div>
                </div>

                {/* Investment Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Invest</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                {[100, 250, 500].map(amount => (
                                    <button
                                        key={amount}
                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium"
                                    >
                                        ${amount}
                                    </button>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Custom amount"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                                    Invest
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Your Position</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 text-sm">Total Invested</span>
                                <span className="font-medium">${formatNumber(userInvestment)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 text-sm">Current Value</span>
                                <span className="font-medium text-green-600">${formatNumber(userInvestment * 1.15)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 text-sm">Profit/Loss</span>
                                <span className="font-medium text-green-600">+${formatNumber(userInvestment * 0.15)} (+15%)</span>
                            </div>
                            <button className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium mt-3">
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-4 sm:p-6 border-b">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-4">
                            {[
                                { type: 'Investment', amount: 500, date: '2024-01-15', status: 'Completed' },
                                { type: 'Investment', amount: 250, date: '2024-01-10', status: 'Completed' },
                                { type: 'Investment', amount: 500, date: '2024-01-05', status: 'Completed' },
                            ].map((transaction, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">{transaction.type}</p>
                                        <p className="text-xs sm:text-sm text-gray-600">{transaction.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 text-sm sm:text-base">${formatNumber(transaction.amount)}</p>
                                        <p className="text-xs sm:text-sm text-green-600">{transaction.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
