'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Sidebar from '../../components/webcomponents/sidebar';
import Loading from '../../components/webcomponents/loading';
import Dashboard from './dashboard';
import StatsWidget from './statswidget';
import Card from './card';
import { poolsService, WrapPool, TCGCardData } from '../../services/poolsService';

interface CardData {
	id: string;
	name: string;
	value: number;
	image: string;
}

const WrapPoolPage = () => {
	const searchParams = useSearchParams();
	const { address: userAddress } = useAccount(); // Renamed but kept for future use
	const viewParam = searchParams.get('view') || 'dashboard';
	const poolParam = searchParams.get('pool') || null;

	const [activeView, setActiveView] = useState<string>(viewParam);
	const [isLoading, setIsLoading] = useState(true);
	const [wrapPools, setWrapPools] = useState<WrapPool[]>([]);
	const [currentPoolData, setCurrentPoolData] = useState<any>(null);
	const [error, setError] = useState<string>('');

	// Cargar datos de pools
	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);
				const pools = await poolsService.getWrapPools();
				setWrapPools(pools);

				// Cargar datos del pool seleccionado o el primero disponible
				const targetPool = poolParam || (pools.length > 0 ? pools[0].contract_address : null);
				if (targetPool) {
					const poolStats = await poolsService.getPoolStats(targetPool);
					setCurrentPoolData(poolStats);
				}

			} catch (err) {
				setError('Error al cargar datos de pools');
				console.error('Error loading data:', err);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [poolParam]);

	// Actualizar vista cuando cambie el parámetro de URL
	useEffect(() => {
		if (viewParam !== activeView) {
			setActiveView(viewParam);
		}
	}, [viewParam, activeView]);

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar datos</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
					>
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	// Generar datos para componentes
	const generateComponentData = () => {
		if (!currentPoolData) {
			return {
				cards: [],
				tcgCards: [],
				priceHistory: []
			};
		}

		const { tcgCards, priceHistory } = currentPoolData;
		const cards: CardData[] = tcgCards.map((card: TCGCardData) => ({
			id: card.id,
			name: card.name,
			value: card.marketValue,
			image: card.imageUrl
		}));

		return {
			cards,
			tcgCards,
			priceHistory: priceHistory || []
		};
	};

	const { cards, tcgCards, priceHistory } = generateComponentData();

	// Renderizar contenido principal según la vista activa
	const renderMainContent = () => {
		switch (activeView) {
			case 'dashboard':
				return <Dashboard />;

			case 'statswidget':
				if (!currentPoolData) {
					return <div className="p-6">Cargando datos del pool...</div>;
				}

				return (
					<div className="p-6">
						<StatsWidget
							poolValue={currentPoolData.totalValue || 0}
							priceHistory={priceHistory}
							highestValueCard={currentPoolData.highestValueCard ? {
								id: currentPoolData.highestValueCard.id,
								name: currentPoolData.highestValueCard.name,
								value: currentPoolData.highestValueCard.marketValue,
								image: currentPoolData.highestValueCard.imageUrl
							} : (cards[0] || { id: '1', name: 'Default', value: 0, image: '' })}
							lowestValueCard={currentPoolData.lowestValueCard ? {
								id: currentPoolData.lowestValueCard.id,
								name: currentPoolData.lowestValueCard.name,
								value: currentPoolData.lowestValueCard.marketValue,
								image: currentPoolData.lowestValueCard.imageUrl
							} : (cards[cards.length - 1] || { id: '1', name: 'Default', value: 0, image: '' })}
							tcgName={currentPoolData.pool?.name || "Pool de Cartas"}
							commonTier="Premium"
							totalCards={currentPoolData.totalCards || 0}
							change24h={2.34}
							allCards={cards}
						/>
					</div>
				);

			case 'card':
				return (
					<div className="p-6">
						<h1 className="text-3xl font-bold text-gray-900 mb-8">Colección de Cartas</h1>
						{tcgCards.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{tcgCards.map((card: TCGCardData) => (
									<Card key={card.id} cardData={card} />
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<p className="text-gray-500">No hay cartas disponibles en este pool</p>
							</div>
						)}
					</div>
				);

			default:
				return <Dashboard />;
		}
	};

	// Pool selector component
	const PoolSelector = () => {
		if (wrapPools.length <= 1) return null;

		return (
			<div className="mb-6 p-4 bg-white rounded-lg shadow">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Seleccionar Pool:
				</label>
				<select
					value={poolParam || wrapPools[0]?.contract_address || ''}
					onChange={(e) => {
						const newPool = e.target.value;
						window.history.pushState({}, '', `?view=${activeView}&pool=${newPool}`);
						window.location.reload();
					}}
					className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				>
					{wrapPools.map((pool) => (
						<option key={pool.contract_address} value={pool.contract_address}>
							{pool.name} ({pool.symbol})
						</option>
					))}
				</select>
			</div>
		);
	};

	// View selector component
	const ViewSelector = () => {
		const views = [
			{ key: 'dashboard', name: 'Dashboard', description: 'Vista principal con estadísticas generales' },
			{ key: 'statswidget', name: 'Stats Widget', description: 'Widget de estadísticas del pool con gráficos' },
			{ key: 'card', name: 'Cards Collection', description: 'Vista detallada de la colección de cartas' }
		];

		return (
			<div className="mb-6 p-4 bg-white rounded-lg shadow">
				<h2 className="text-lg font-semibold mb-4">View Options</h2>
				<div className="flex flex-wrap gap-2">
					{views.map(view => (
						<button
							key={view.key}
							onClick={() => {
								setActiveView(view.key);
								window.history.pushState({}, '', `?view=${view.key}${poolParam ? `&pool=${poolParam}` : ''}`);
							}}
							className={`px-3 py-2 rounded-lg text-sm font-medium ${activeView === view.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							title={view.description}
						>
							{view.name}
						</button>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="flex-1 bg-gray-50 p-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">My Pools</h1>
				{currentPoolData?.pool && (
					<div className="mb-6">
						<h2 className="text-xl font-semibold text-gray-800">
							{currentPoolData.pool.name} <span className="text-sm text-gray-500">({currentPoolData.pool.symbol})</span>
						</h2>
					</div>
				)}
				<PoolSelector />
				<ViewSelector />
				{renderMainContent()}
			</main>
		</div>
	);
};

export default WrapPoolPage;
