import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';

interface Card {
    id: string;
    name: string;
    value: number;
    image: string;
}

interface PriceData {
    date: string;
    value: number;
}

interface StatsWidgetProps {
    poolValue: number;
    priceHistory: PriceData[];
    highestValueCard: Card;
    lowestValueCard: Card;
    tcgName: string;
    commonTier: string;
    totalCards: number;
    change24h: number;
    allCards: Card[]; // New prop for all cards in the pool
}

const StatsWidget: React.FC<StatsWidgetProps> = ({
    poolValue,
    priceHistory,
    highestValueCard,
    lowestValueCard,
    tcgName,
    commonTier,
    totalCards,
    change24h,
    allCards
}) => {
    const router = useRouter();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    const formatPercent = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    const handleCardClick = (cardId: string) => {
        router.push(`/card/${cardId}`);
    };

    return (
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2">{tcgName} Pool</h1>
                <div className="flex items-center justify-center gap-4">
                    <span className="text-5xl font-bold">{formatCurrency(poolValue)}</span>
                    <span className={`text-lg px-3 py-1 rounded-full ${
                        change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                        {formatPercent(change24h)}
                    </span>
                </div>
                <p className="text-gray-300 mt-2">{totalCards} cards • {commonTier} tier</p>
            </div>

            {/* Price Chart */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Price History</h3>
                <div className="bg-black/20 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={priceHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1F2937', 
                                    border: 'none', 
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                }} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8B5CF6" 
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Card Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Highest Value Card */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-lg border border-yellow-500/30">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">Highest Value Card</h3>
                    <div 
                        className="flex items-center gap-4 cursor-pointer hover:bg-yellow-500/10 p-2 rounded-lg transition-colors"
                        onClick={() => handleCardClick(highestValueCard.id)}
                    >
                        <img 
                            src={highestValueCard.image} 
                            alt={highestValueCard.name}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                            <p className="font-medium">{highestValueCard.name}</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                {formatCurrency(highestValueCard.value)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lowest Value Card */}
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-lg border border-blue-500/30">
                    <h3 className="text-lg font-semibold mb-3 text-blue-400">Lowest Value Card</h3>
                    <div 
                        className="flex items-center gap-4 cursor-pointer hover:bg-blue-500/10 p-2 rounded-lg transition-colors"
                        onClick={() => handleCardClick(lowestValueCard.id)}
                    >
                        <img 
                            src={lowestValueCard.image} 
                            alt={lowestValueCard.name}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                            <p className="font-medium">{lowestValueCard.name}</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {formatCurrency(lowestValueCard.value)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Cards in Pool */}
            <div>
                <h3 className="text-xl font-semibold mb-4">All Cards in Pool</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {allCards.map((card) => (
                        <div 
                            key={card.id}
                            className="bg-black/20 p-4 rounded-lg cursor-pointer hover:bg-black/30 transition-colors border border-gray-700 hover:border-purple-500"
                            onClick={() => handleCardClick(card.id)}
                        >
                            <img 
                                src={card.image} 
                                alt={card.name}
                                className="w-full aspect-[3/4] rounded-lg object-cover mb-2"
                            />
                            <p className="text-sm font-medium truncate">{card.name}</p>
                            <p className="text-purple-400 font-bold text-sm">
                                {formatCurrency(card.value)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsWidget;