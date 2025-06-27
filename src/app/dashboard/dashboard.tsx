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
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
    const [walletBalance] = useState(2.3458);
    const [isConnected, setIsConnected] = useState(true);
    
    const pools = [
        {
            id: 1,
            name: 'Fury Cards Pool',
            description: 'Pokemon TCG Investment Pool',
            value: 8647.52,
            userInvestment: 1250.00,
            investors: 47,
            daysActive: 42,
            performance: '+12.5%',
            isPositive: true,
            gradient: 'from-orange-500 to-red-600'
        },
        {
            id: 2,
            name: 'Mystic Collectibles',
            description: 'Yu-Gi-Oh! & Magic Cards',
            value: 15420.83,
            userInvestment: 850.00,
            investors: 73,
            daysActive: 28,
            performance: '+8.2%',
            isPositive: true,
            gradient: 'from-blue-500 to-purple-600'
        },
        {
            id: 3,
            name: 'Vintage Sports',
            description: 'Baseball & Basketball Cards',
            value: 5234.67,
            userInvestment: 400.00,
            investors: 29,
            daysActive: 15,
            performance: '-3.1%',
            isPositive: false,
            gradient: 'from-green-500 to-teal-600'
        }
    ];

    const totalInvestment = pools.reduce((sum, pool) => sum + pool.userInvestment, 0);
    const totalPoolValue = pools.reduce((sum, pool) => sum + pool.value, 0);

    const handleDisconnect = () => {
        setIsConnected(false);
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
                {/* Portfolio Overview */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h2>
                    <p className="text-gray-600">Track your investments across all pools</p>
                </div>

                {/* Total Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Total Pool Value</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">${totalPoolValue.toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Your Investment</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">${totalInvestment.toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Active Pools</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{pools.length}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                            <span className="text-xs sm:text-sm text-gray-600">Wallet Balance</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{walletBalance} ETH</p>
                    </div>
                </div>

                {/* Pools Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6 sm:mb-8">
                    {pools.map((pool) => (
                        <div key={pool.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className={`bg-gradient-to-r ${pool.gradient} p-4 text-white`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold">{pool.name}</h3>
                                    <div className={`flex items-center space-x-1 ${pool.isPositive ? 'text-green-200' : 'text-red-200'}`}>
                                        {pool.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        <span className="text-sm font-medium">{pool.performance}</span>
                                    </div>
                                </div>
                                <p className="text-sm opacity-90">{pool.description}</p>
                            </div>
                            
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Pool Value</p>
                                        <p className="font-semibold text-gray-900">${pool.value.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Your Investment</p>
                                        <p className="font-semibold text-gray-900">${pool.userInvestment.toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Users className="w-3 h-3" />
                                        <span>{pool.investors} investors</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{pool.daysActive} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-4 sm:p-6 border-b">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">Charizard VMAX purchased - Fury Cards Pool</p>
                                    <p className="text-xs sm:text-sm text-gray-600">2 hours ago</p>
                                </div>
                                <span className="text-green-600 font-semibold text-sm sm:text-base">+$2,450</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">Black Lotus sold - Mystic Collectibles</p>
                                    <p className="text-xs sm:text-sm text-gray-600">6 hours ago</p>
                                </div>
                                <span className="text-blue-600 font-semibold text-sm sm:text-base">+$8,200</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">New investor joined - Vintage Sports</p>
                                    <p className="text-xs sm:text-sm text-gray-600">1 day ago</p>
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