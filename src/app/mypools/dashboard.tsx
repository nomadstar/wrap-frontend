'use client';
import React, { useState } from 'react';
import { 
    Wallet, 
    TrendingUp, 
    DollarSign, 
    LogOut,
    Zap,
    Users,
    Calendar,
    Grid3X3,
    ChevronDown,
    ArrowLeft
} from 'lucide-react';

const Dashboard = () => {
    const [userInvestment] = useState(1250.00);
    const [isConnected, setIsConnected] = useState(true);
    const [showPoolsMenu, setShowPoolsMenu] = useState(false);
    const [selectedPool, setSelectedPool] = useState('fury-cards');

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

    const handleDisconnect = () => {
        setIsConnected(false);
    };

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
                    <p className="text-sm sm:text-base text-gray-600 mb-6">Please reconnect to continue.</p>
                    <button
                        onClick={() => setIsConnected(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 text-sm sm:text-base"
                    >
                        Reconnect Wallet
                    </button>
                </div>
            </div>
        );
    }

    if (showPoolsMenu) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowPoolsMenu(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm sm:text-base">W</span>
                                </div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900">All Pools</h1>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-2 sm:px-3 py-2 rounded-lg"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm sm:text-base">Disconnect</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pools.map((pool) => {
                            const IconComponent = pool.icon;
                            return (
                                <div
                                    key={pool.id}
                                    onClick={() => handlePoolSelect(pool.id)}
                                    className="cursor-pointer transform hover:scale-105 transition-transform"
                                >
                                    <div className={`bg-gradient-to-r ${pool.gradient} rounded-xl p-6 text-white mb-4`}>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <IconComponent className="w-8 h-8" />
                                            <h3 className="text-xl font-bold">{pool.name}</h3>
                                        </div>
                                        <p className="text-white/80 mb-4">{pool.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-white/80">Pool Value</p>
                                                <p className="text-2xl font-bold">${pool.value.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-white/80">Investors</p>
                                                <p className="text-2xl font-bold">{pool.investors}</p>
                                            </div>
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
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm sm:text-base">W</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">WrapSell</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowPoolsMenu(true)}
                                className="flex items-center space-x-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg"
                            >
                                <Grid3X3 className="w-4 h-4" />
                                <span className="text-sm sm:text-base">All Pools</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDisconnect}
                                className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-2 sm:px-3 py-2 rounded-lg"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm sm:text-base">Disconnect</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Pool Header */}
                <div className={`bg-gradient-to-r ${currentPool?.gradient} rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-white`}>
                    <div className="flex items-center space-x-3 mb-2">
                        {currentPool?.icon && <currentPool.icon className="w-6 h-6 sm:w-8 sm:h-8" />}
                        <h2 className="text-xl sm:text-2xl font-bold">{currentPool?.name}</h2>
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
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">${currentPool?.value.toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Your Investment</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">${userInvestment.toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Investors</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentPool?.investors}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Days Active</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">42</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-4 sm:p-6 border-b">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Pool Activity</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">Rare card purchased</p>
                                    <p className="text-xs sm:text-sm text-gray-600">2 hours ago</p>
                                </div>
                                <span className="text-green-600 font-semibold text-sm sm:text-base">+$2,450</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">Card sold at profit</p>
                                    <p className="text-xs sm:text-sm text-gray-600">1 day ago</p>
                                </div>
                                <span className="text-blue-600 font-semibold text-sm sm:text-base">+$680</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">New investor joined</p>
                                    <p className="text-xs sm:text-sm text-gray-600">3 days ago</p>
                                </div>
                                <span className="text-purple-600 font-semibold text-sm sm:text-base">+$500</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;