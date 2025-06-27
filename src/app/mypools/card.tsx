'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';



interface PriceHistory {
    date: string;
    value: number;
}

interface TCGCardData {
    id: string;
    name: string;
    imageUrl: string;
    tcgName: string;
    marketValue: number;
    rarity: string;
    condition: string;
    set: string;
    priceHistory: PriceHistory[];
}

interface CardProps {
    cardData: TCGCardData;
}

const Card: React.FC<CardProps> = ({ cardData }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCardClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsExpanded(false);
        }
    };

    return (
        <>
            {/* Main Card */}
            <div 
                className={`bg-white rounded-lg shadow-lg overflow-hidden max-w-sm mx-auto cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    isExpanded ? 'transform scale-110' : ''
                }`}
                onClick={handleCardClick}
            >
                {/* Card Image */}
                <div className="relative">
                    <img
                        src={cardData.imageUrl}
                        alt={cardData.name}
                        className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {cardData.tcgName}
                    </div>
                </div>

                {/* Card Details */}
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{cardData.name}</h3>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">ID:</span>
                            <span className="font-medium">{cardData.id}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600">Set:</span>
                            <span className="font-medium">{cardData.set}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rarity:</span>
                            <span className="font-medium text-purple-600">{cardData.rarity}</span>
                        </div>
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600">Condition:</span>
                            <span className="font-medium">{cardData.condition}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-gray-600">Market Value:</span>
                            <span className="font-bold text-green-600 text-lg">
                                ${cardData.marketValue.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Price Chart */}
                    {cardData.priceHistory && cardData.priceHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Price History</h4>
                            <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={cardData.priceHistory}>
                                        <XAxis 
                                            dataKey="date" 
                                            tick={{ fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip 
                                            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']}
                                            labelStyle={{ fontSize: '12px' }}
                                            contentStyle={{ fontSize: '12px' }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Modal Overlay */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={handleOverlayClick}
                >
                    <div 
                        className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-spin-scale"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Expanded Card Image */}
                        <div className="relative">
                            <img
                                src={cardData.imageUrl}
                                alt={cardData.name}
                                className="w-full h-80 object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm">
                                {cardData.tcgName}
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm hover:bg-opacity-90 transition-all"
                            >
                                ✕ Close
                            </button>
                        </div>

                        {/* Expanded Card Details */}
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">{cardData.name}</h3>
                            
                            <div className="grid grid-cols-2 gap-4 text-base mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID:</span>
                                    <span className="font-medium">{cardData.id}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Set:</span>
                                    <span className="font-medium">{cardData.set}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rarity:</span>
                                    <span className="font-medium text-purple-600">{cardData.rarity}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Condition:</span>
                                    <span className="font-medium">{cardData.condition}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-center items-center py-4 border-t border-b mb-6">
                                <span className="text-gray-600 text-lg mr-4">Market Value:</span>
                                <span className="font-bold text-green-600 text-3xl">
                                    ${cardData.marketValue.toFixed(2)}
                                </span>
                            </div>

                            {/* Expanded Price Chart */}
                            {cardData.priceHistory && cardData.priceHistory.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-medium text-gray-700 mb-4">Price History</h4>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={cardData.priceHistory}>
                                                <XAxis 
                                                    dataKey="date" 
                                                    tick={{ fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis 
                                                    tick={{ fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip 
                                                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']}
                                                    labelStyle={{ fontSize: '14px' }}
                                                    contentStyle={{ fontSize: '14px' }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="#10b981" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin-scale {
                    0% {
                        transform: scale(0.8) rotate(-180deg);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }
                
                .animate-spin-scale {
                    animation: spin-scale 0.4s ease-out;
                }
            `}</style>
        </>
    );
};

export default Card;