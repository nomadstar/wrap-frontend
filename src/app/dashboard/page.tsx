'use client';
import React, { useState } from 'react';
import Navbar from '../../components/webcomponents/Navbar';
import { useWalletRedirect } from '../../hooks/useWalletRedirect';

import Dashboard from './dashboard';
import StatsWidget from './statswidget';
import Card from './card';

// Mock data for demonstration
const mockPriceHistory = [
	{ date: '2024-01-01', value: 1250 },
	{ date: '2024-01-02', value: 1300 },
	{ date: '2024-01-03', value: 1280 },
	{ date: '2024-01-04', value: 1350 },
	{ date: '2024-01-05', value: 1400 },
	{ date: '2024-01-06', value: 1380 },
	{ date: '2024-01-07', value: 1420 },
];

const mockCards = [
	{
		id: '1',
		name: 'Black Lotus',
		value: 25000,
		image: 'https://images.pokemontcg.io/base1/4_hires.png',
	},
	{
		id: '2',
		name: 'Ancestral Recall',
		value: 8500,
		image: 'https://images.pokemontcg.io/base1/6_hires.png',
	},
	{
		id: '3',
		name: 'Time Walk',
		value: 3200,
		image: 'https://images.pokemontcg.io/base1/8_hires.png',
	},
	{
		id: '4',
		name: 'Mox Pearl',
		value: 1500,
		image: 'https://images.pokemontcg.io/base1/16_hires.png',
	},
	{
		id: '5',
		name: 'Lightning Bolt',
		value: 45,
		image: 'https://images.pokemontcg.io/base1/24_hires.png',
	},
	{
		id: '6',
		name: 'Giant Growth',
		value: 12,
		image: 'https://images.pokemontcg.io/base1/37_hires.png',
	},
];

const mockTCGCards = [
	{
		id: '1',
		name: 'Black Lotus',
		imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
		tcgName: 'Magic: The Gathering',
		marketValue: 25000,
		rarity: 'Rare',
		condition: 'Near Mint',
		set: 'Alpha',
		priceHistory: mockPriceHistory,
	},
	{
		id: '2',
		name: 'Ancestral Recall',
		imageUrl: 'https://images.pokemontcg.io/base1/6_hires.png',
		tcgName: 'Magic: The Gathering',
		marketValue: 8500,
		rarity: 'Rare',
		condition: 'Lightly Played',
		set: 'Alpha',
		priceHistory: mockPriceHistory.map((p) => ({ ...p, value: p.value * 0.34 })),
	},
	{
		id: '3',
		name: 'Time Walk',
		imageUrl: 'https://images.pokemontcg.io/base1/8_hires.png',
		tcgName: 'Magic: The Gathering',
		marketValue: 3200,
		rarity: 'Rare',
		condition: 'Near Mint',
		set: 'Alpha',
		priceHistory: mockPriceHistory.map((p) => ({ ...p, value: p.value * 0.26 })),
	},
];

const WrapPoolPage = () => {
	const { isWalletConnected } = useWalletRedirect(); // Hook para redirección automática
	const [activeView, setActiveView] = useState<'dashboard' | 'pool' | 'cards'>('dashboard');

	const renderMainContent = () => {
		switch (activeView) {
			case 'dashboard':
				return <Dashboard />;
			case 'pool':
				return (
					<div className="p-6">
						<StatsWidget
							poolValue={38257}
							priceHistory={mockPriceHistory}
							highestValueCard={mockCards[0]}
							lowestValueCard={mockCards[5]}
							tcgName="Magic: The Gathering"
							commonTier="Premium"
							totalCards={6}
							change24h={2.34}
							allCards={mockCards}
						/>
					</div>
				);
			case 'cards':
				return (
					<div className="p-6">
						<h1 className="text-3xl font-bold text-gray-900 mb-8">Card Collection</h1>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{mockTCGCards.map((card) => (
								<Card key={card.id} cardData={card} />
							))}
						</div>
					</div>
				);
			default:
				return <Dashboard />;
		}
	};

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-50">
				<main className="max-w-7xl mx-auto p-6">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
						<div className="flex space-x-4">
							<button
								onClick={() => setActiveView('dashboard')}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'dashboard'
									? 'bg-blue-600 text-white'
									: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
							>
								Dashboard
							</button>
							<button
								onClick={() => setActiveView('cards')}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'cards'
									? 'bg-blue-600 text-white'
									: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
							>
								Cards
							</button>
						</div>
					</div>
					{renderMainContent()}
				</main>
			</div>
		</>
	);
};

export default WrapPoolPage;

