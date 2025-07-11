'use client';
import React from 'react';
import {
    Wallet,
    TrendingUp,
    DollarSign,
    Zap,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw
} from 'lucide-react';
import { useDashboard, useWalletBalance, useFormattedPools } from '@/hooks/useDashboard';
import { useWalletPersistence } from '@/hooks/useWalletPersistence';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

const Dashboard = () => {
    const { address, isConnected } = useWalletPersistence();

    const { dashboardData, pools, userSummary, loading, error, refetch } = useDashboard(address || null);
    const { balance: walletBalance } = useWalletBalance(address || null);
    const formattedPools = useFormattedPools(pools);

    const handleRefresh = () => {
        refetch();
    };

    // Calcular totales desde los datos reales
    const totalInvestment = userSummary?.total_investment || 0;
    const totalPoolValue = pools.reduce((sum, pool) => sum + (pool.current_amount || 0), 0);

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

    if (loading) {
        return <Loading message="Loading dashboard..." />;
    }

    if (error) {
        return <ErrorDisplay error={error} onRetry={handleRefresh} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{formattedPools.length}</p>
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
                    {formattedPools.map((pool) => (
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
                        {userSummary?.recent_activity && userSummary.recent_activity.length > 0 ? (
                            <div className="space-y-4">
                                {userSummary.recent_activity.map((activity, index) => (
                                    <div key={activity.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm sm:text-base">{activity.description}</p>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`font-semibold text-sm sm:text-base ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 mb-2">No recent activity</p>
                                <p className="text-sm text-gray-500">Your investment activity will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;