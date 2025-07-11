'use client';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Loading from '../../components/webcomponents/loading';
import Navbar from '../../components/webcomponents/Navbar';
import { useWalletRedirect } from '../../hooks/useWalletRedirect';
import { poolsService, WrapPool } from '../../services/poolsService';

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wrapsell-backend-e9c344d91fb8.herokuapp.com';

interface Card {
    id: number;
    name: string;
    card_id: string;
    edition: string;
    market_value: number;
    url?: string;
    user_wallet?: string;
    pool_id?: number | null;
    created_at: string;
}

const AdminPage = () => {
    const { address } = useAccount();
    const { isWalletConnected } = useWalletRedirect(); // Hook para redirección automática
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [wrapPools, setWrapPools] = useState<WrapPool[]>([]);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [cards, setCards] = useState<Card[]>([]);

    // Add card by URL form data
    const [addCardData, setAddCardData] = useState({
        url: '',
        userWallet: '',
        poolId: '',
    });

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                setIsLoading(true);
                const adminStatus = await poolsService.checkAdminStatus(address || '');
                setIsAdmin(adminStatus);

                if (adminStatus) {
                    const [pools, allCards] = await Promise.all([
                        poolsService.getWrapPools(),
                        fetchCards()
                    ]);
                    setWrapPools(pools);
                    setCards(allCards);
                }
            } catch (err) {
                console.error('Error checking admin status:', err);
                setError('Error checking admin permissions');
            } finally {
                setIsLoading(false);
            }
        };

        if (address) {
            checkAdminStatus();
        } else {
            setIsLoading(false);
            setError('Please connect your wallet to access admin features');
        }
    }, [address]);

    // Fetch cards from backend
    const fetchCards = async (): Promise<Card[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/cards`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching cards: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching cards:', error);
            return [];
        }
    };

    const handleAddCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAddCardData(prev => ({ ...prev, [name]: value }));
    };

    const addCardByUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const { url, userWallet, poolId } = addCardData;

            if (!url || !userWallet) {
                setError('URL and User Wallet are required');
                return;
            }

            // Validate URL format
            if (!url.includes('pricecharting.com')) {
                setError('Please provide a valid PriceCharting.com URL');
                return;
            }

            const requestBody = {
                admin_wallet: address,
                url: url.trim(),
                user_wallet: userWallet.trim(),
                pool_id: poolId ? parseInt(poolId) : null
            };

            const response = await fetch(`${API_BASE_URL}/cards_admin/add-by-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setSuccessMessage(`Card added successfully! Card ID: ${result.card_id}`);

            // Reset form
            setAddCardData({
                url: '',
                userWallet: '',
                poolId: '',
            });

            // Refresh data
            const [pools, allCards] = await Promise.all([
                poolsService.getWrapPools(),
                fetchCards()
            ]);
            setWrapPools(pools);
            setCards(allCards);

        } catch (err) {
            console.error('Error adding card:', err);
            setError(err instanceof Error ? err.message : 'Failed to add card. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!isAdmin) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                        <p className="text-gray-700 mb-6">
                            You don't have permission to access the admin area. Please connect with an admin wallet.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard - Card Manager</h1>
                        <div className="text-sm text-gray-600">
                            Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                            {successMessage}
                        </div>
                    )}

                    {/* Add Card by URL Section */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Card by PriceCharting URL</h2>
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
                            <p className="text-sm">
                                <strong>Instructions:</strong> Provide a valid PriceCharting.com URL for a Pokémon TCG card. 
                                The system will automatically extract card data including name, edition, market value, and card ID.
                            </p>
                            <p className="text-sm mt-2">
                                <strong>Example:</strong> https://www.pricecharting.com/game/pokemon-base-set/charizard-4
                            </p>
                        </div>
                        
                        <form onSubmit={addCardByUrl}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        PriceCharting.com URL *
                                    </label>
                                    <input
                                        type="url"
                                        name="url"
                                        value={addCardData.url}
                                        onChange={handleAddCardChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://www.pricecharting.com/game/pokemon-..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        User Wallet Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="userWallet"
                                        value={addCardData.userWallet}
                                        onChange={handleAddCardChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0x..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Associate to Pool (Optional)
                                    </label>
                                    <select
                                        name="poolId"
                                        value={addCardData.poolId}
                                        onChange={handleAddCardChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- No Pool --</option>
                                        {wrapPools.map(pool => (
                                            <option key={pool.id} value={pool.id}>
                                                {pool.name} ({pool.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Adding Card...' : 'Add Card from URL'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Current Cards List */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Cards</h2>

                        {cards.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Edition
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Card ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Market Value
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User Wallet
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pool
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Source URL
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {cards.slice(0, 20).map((card) => (
                                            <tr key={card.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {card.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {card.edition}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {card.card_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${Number(card.market_value || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-mono">
                                                        {card.user_wallet ? 
                                                            `${card.user_wallet.substring(0, 6)}...${card.user_wallet.substring(card.user_wallet.length - 4)}`
                                                            : 'N/A'
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {card.pool_id ? `Pool ${card.pool_id}` : 'None'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {card.url ? (
                                                        <a 
                                                            href={card.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            View Source
                                                        </a>
                                                    ) : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No cards added yet</p>
                        )}
                    </div>

                    {/* Current Pools List */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Wrap Pools</h2>

                        {wrapPools.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Symbol
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contract Address
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Owner
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {wrapPools.map((pool) => (
                                            <tr key={pool.contract_address}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pool.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pool.symbol}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-mono">
                                                        {pool.contract_address.substring(0, 8)}...{pool.contract_address.substring(pool.contract_address.length - 6)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-mono">
                                                        {pool.owner_wallet.substring(0, 6)}...{pool.owner_wallet.substring(pool.owner_wallet.length - 4)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No pools available yet</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminPage;