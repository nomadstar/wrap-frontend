'use client';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import {
	TrendingUp,
	DollarSign,
	Users,
	Activity,
	ChevronRight,
	Wallet,
	BarChart3,
	PieChart,
	Search,
	Plus
} from 'lucide-react';
import Navbar from '../../components/webcomponents/Navbar';
import { useWalletRedirect } from '../../hooks/useWalletRedirect';
import { poolsService, WrapPool, WrapSell } from '../../services/poolsService';

interface PoolStats {
	totalValue: number;
	totalCards: number;
	totalTokens: string;
	change24h: number;
	wrapsells: WrapSell[];
}

const MyPoolsPage = () => {
	const { address, isConnected } = useAccount();
	const router = useRouter();
	const { isWalletConnected } = useWalletRedirect(); // Hook para redirección automática
	const [isAdmin, setIsAdmin] = useState(false);
	const [wrapPools, setWrapPools] = useState<WrapPool[]>([]);
	const [userPools, setUserPools] = useState<WrapPool[]>([]);
	const [availablePools, setAvailablePools] = useState<WrapPool[]>([]);
	const [poolStats, setPoolStats] = useState<{ [key: string]: PoolStats }>({});
	const [error, setError] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		const loadData = async () => {
			if (!isConnected || !address) {
				return;
			}

			try {

				// Verificar si el usuario es admin
				const adminStatus = await poolsService.checkAdminStatus(address || '');
				setIsAdmin(adminStatus);

				// Cargar todos los pools y WrapSells
				const [pools, wrapsells] = await Promise.all([
					poolsService.getWrapPools(),
					poolsService.getWrapSells()
				]);

				setWrapPools(pools);

				// Filtrar pools del usuario (donde el usuario es owner o tiene tokens)
				const myPools = pools.filter(pool =>
					pool.owner_wallet.toLowerCase() === address.toLowerCase() ||
					wrapsells.some(ws => ws.wrap_pool_address === pool.contract_address &&
						ws.owner_wallet.toLowerCase() === address.toLowerCase())
				);

				// Pools disponibles para unirse (todos los pools que no son del usuario)
				const otherPools = pools.filter(pool =>
					!myPools.some(userPool => userPool.contract_address === pool.contract_address)
				);

				setUserPools(myPools);
				setAvailablePools(otherPools);

				// Calcular estadísticas para cada pool del usuario
				const stats: { [key: string]: PoolStats } = {};

				for (const pool of myPools) {
					const poolWrapsells = wrapsells.filter(ws => ws.wrap_pool_address === pool.contract_address);
					const totalValue = poolWrapsells.reduce((sum, ws) =>
						sum + (parseFloat(ws.estimated_value_per_card) / Math.pow(10, 18)), 0
					);
					const totalCards = poolWrapsells.reduce((sum, ws) => sum + ws.total_cards_deposited, 0);
					const totalTokens = poolWrapsells.reduce((sum, ws) =>
						sum + parseFloat(ws.total_tokens_issued), 0
					).toString();

					stats[pool.contract_address] = {
						totalValue,
						totalCards,
						totalTokens,
						change24h: (Math.random() - 0.5) * 10, // Mock data for now
						wrapsells: poolWrapsells
					};
				}

				setPoolStats(stats);

			} catch (err) {
				console.error('Error loading pools data:', err);
				setError('Error al cargar datos de pools');
			}
		};

		loadData();
	}, [address, isConnected]);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(value);
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('en-US').format(num);
	};

	const getTotalPortfolioValue = () => {
		return Object.values(poolStats).reduce((sum, stats) => sum + stats.totalValue, 0);
	};

	const getTotalCards = () => {
		return Object.values(poolStats).reduce((sum, stats) => sum + stats.totalCards, 0);
	};

	const filteredAvailablePools = availablePools.filter(pool =>
		pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		pool.symbol.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (!isConnected) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
					<Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
					<p className="text-gray-600 mb-6">
						Please connect your wallet to view your pools and investments.
					</p>
					<button
						onClick={() => router.push('/')}
						className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Connect Wallet
					</button>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<Activity className="w-8 h-8 text-red-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-50">
				{/* Header */}
				<div className="bg-white shadow-sm border-b">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center py-6">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">My Pools</h1>
								<p className="text-gray-600 mt-1">Manage your WrapSell investments and discover new pools</p>
							</div>
							<div className="flex items-center space-x-4">
								{isAdmin && (
									<button
										onClick={() => router.push('/admin')}
										className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
									>
										<Plus className="w-4 h-4 mr-2" />
										Create Pool
									</button>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Portfolio Overview */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<div className="bg-white p-6 rounded-xl shadow-sm">
							<div className="flex items-center">
								<DollarSign className="w-8 h-8 text-green-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
									<p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalPortfolioValue())}</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-6 rounded-xl shadow-sm">
							<div className="flex items-center">
								<BarChart3 className="w-8 h-8 text-blue-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">Active Pools</p>
									<p className="text-2xl font-bold text-gray-900">{userPools.length}</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-6 rounded-xl shadow-sm">
							<div className="flex items-center">
								<PieChart className="w-8 h-8 text-purple-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">Total Cards</p>
									<p className="text-2xl font-bold text-gray-900">{formatNumber(getTotalCards())}</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-6 rounded-xl shadow-sm">
							<div className="flex items-center">
								<TrendingUp className="w-8 h-8 text-orange-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">24h Change</p>
									<p className="text-2xl font-bold text-green-600">+2.34%</p>
								</div>
							</div>
						</div>
					</div>

					{/* Pools List */}
					<div className="bg-white rounded-xl shadow-sm">
						<div className="px-6 py-4 border-b border-gray-200">
							<h2 className="text-xl font-semibold text-gray-900">Your Pools</h2>
						</div>

						{userPools.length === 0 ? (
							<div className="text-center py-12">
								<Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No Pools Yet</h3>
								<p className="text-gray-600 mb-6">You haven't created or joined any pools yet.</p>
								<button
									onClick={() => router.push('/admin')}
									className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
								>
									Create Your First Pool
								</button>
							</div>
						) : (
							<div className="divide-y divide-gray-200">
								{userPools.map((pool) => {
									const stats = poolStats[pool.contract_address];
									const isOwner = pool.owner_wallet.toLowerCase() === address?.toLowerCase();

									return (
										<div
											key={pool.contract_address}
											className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
											onClick={() => router.push(`/pools/${pool.contract_address}`)}
										>
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="flex items-center mb-2">
														<h3 className="text-lg font-semibold text-gray-900">{pool.name}</h3>
														<span className="ml-3 text-sm text-gray-500">({pool.symbol})</span>
														{isOwner && (
															<span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
																Owner
															</span>
														)}
													</div>

													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
														<div>
															<p className="text-sm text-gray-600">Pool Value</p>
															<p className="font-semibold text-gray-900">
																{stats ? formatCurrency(stats.totalValue) : '--'}
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-600">Cards</p>
															<p className="font-semibold text-gray-900">
																{stats ? formatNumber(stats.totalCards) : '--'}
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-600">WrapSells</p>
															<p className="font-semibold text-gray-900">
																{stats ? stats.wrapsells.length : '--'}
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-600">Health Status</p>
															<p className={`font-semibold ${pool.is_healthy ? 'text-green-600' : 'text-red-600'}`}>
																{pool.is_healthy ? 'Healthy' : 'Unhealthy'}
															</p>
														</div>
													</div>
												</div>

												<ChevronRight className="w-5 h-5 text-gray-400" />
											</div>
										</div>
									);
								})}
							</div>)}
					</div>
				</div>
			</div>
		</>
	);
};

export default MyPoolsPage;
