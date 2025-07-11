'use client';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Loading from '../../components/webcomponents/loading';
import Navbar from '../../components/webcomponents/Navbar';
import { useWalletRedirect } from '../../hooks/useWalletRedirect';
import { poolsService, WrapPool } from '../../services/poolsService';
import { fetchReownWallet } from '../api';

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

interface WrapSellContract {
    id: number;
    contract_address: string;
    name: string;
    symbol: string;
    card_id: number;
    card_name: string;
    rarity: string;
    estimated_value_per_card: string;
    owner_wallet: string;
    wrap_pool_address?: string;
    total_supply: string;
    total_cards_deposited: number;
    total_tokens_issued: string;
    transaction_hash?: string;
    block_number?: number;
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
    const [wrapSellContracts, setWrapSellContracts] = useState<WrapSellContract[]>([]);

    // Add card by URL form data
    const [addCardData, setAddCardData] = useState({
        url: '',
        poolId: '',
    });

    // Deploy WrapSell contract form data
    const [deployContractData, setDeployContractData] = useState({
        name: '',
        symbol: '',
        cardId: '',
        cardName: '',
        rarity: '',
        estimatedValuePerCard: '',
        wrapPoolAddress: '',
    });

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                setIsLoading(true);
                const adminStatus = await poolsService.checkAdminStatus(address || '');
                setIsAdmin(adminStatus);

                if (adminStatus) {
                    const [pools, allCards, wrapSellContracts] = await Promise.all([
                        poolsService.getWrapPools(),
                        fetchCards(),
                        fetchWrapSellContracts()
                    ]);
                    setWrapPools(pools);
                    setCards(allCards);
                    setWrapSellContracts(wrapSellContracts);
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

    // Fetch WrapSell contracts from backend
    const fetchWrapSellContracts = async (): Promise<WrapSellContract[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/contracts/wrapsell`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching WrapSell contracts: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching WrapSell contracts:', error);
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
            const { url, poolId } = addCardData;

            if (!url || !address) {
                setError('URL is required and wallet must be connected');
                return;
            }

            // Validate URL format
            if (!url.includes('pricecharting.com')) {
                setError('Please provide a valid PriceCharting.com URL');
                return;
            }

            // Reown wallet to get the correct address
            const reownWallet = await fetchReownWallet(address);

            const requestBody = {
                admin_wallet: reownWallet,
                url: url.trim(),
                user_wallet: reownWallet, // Use connected wallet
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
                poolId: '',
            });

            // Refresh data
            const [pools, allCards, wrapSellContracts] = await Promise.all([
                poolsService.getWrapPools(),
                fetchCards(),
                fetchWrapSellContracts()
            ]);
            setWrapPools(pools);
            setCards(allCards);
            setWrapSellContracts(wrapSellContracts);

        } catch (err) {
            console.error('Error adding card:', err);
            setError(err instanceof Error ? err.message : 'Failed to add card. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeployContractChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDeployContractData(prev => ({ ...prev, [name]: value }));
    };

    const deployWrapSellContract = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const { name, symbol, cardId, cardName, rarity, estimatedValuePerCard, wrapPoolAddress } = deployContractData;

            if (!name || !symbol || !cardId || !cardName || !rarity || !estimatedValuePerCard) {
                setError('All fields except Wrap Pool Address are required');
                return;
            }

            const requestBody = {
                admin_wallet: address,
                name: name.trim(),
                symbol: symbol.trim(),
                card_id: parseInt(cardId),
                card_name: cardName.trim(),
                rarity: rarity.trim(),
                estimated_value_per_card: parseFloat(estimatedValuePerCard),
                wrap_pool_address: wrapPoolAddress || null
            };

            const response = await fetch(`${API_BASE_URL}/contracts/wrapsell/deploy`, {
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
            setSuccessMessage(
                `WrapSell contract deployed successfully! 
                Contract Address: ${result.contract_address}
                Transaction: ${result.transaction_hash}
                Gas Used: ${result.gas_used}`
            );

            // Reset form
            setDeployContractData({
                name: '',
                symbol: '',
                cardId: '',
                cardName: '',
                rarity: '',
                estimatedValuePerCard: '',
                wrapPoolAddress: '',
            });

            // Refresh pools data
            const [pools, wrapSellContracts] = await Promise.all([
                poolsService.getWrapPools(),
                fetchWrapSellContracts()
            ]);
            setWrapPools(pools);
            setWrapSellContracts(wrapSellContracts);

        } catch (err) {
            console.error('Error deploying WrapSell contract:', err);
            setError(err instanceof Error ? err.message : 'Failed to deploy contract. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!address) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                        <p className="text-gray-700 mb-6">
                            Please connect your wallet to access admin features.
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
    } else if (!isAdmin) {
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
                                The card will be associated with your connected wallet: <span className="font-mono">{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</span>
                            </p>
                            <p className="text-sm mt-2">
                                <strong>Example:</strong> https://www.pricecharting.com/game/pokemon-base-set/charizard-4
                            </p>
                        </div>

                        <form onSubmit={addCardByUrl}>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                <div>
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

                                <div>
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

                    {/* Deploy WrapSell Contract Section */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Deploy WrapSell Contract</h2>
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
                            <p className="text-sm">
                                <strong>⚠️ Warning:</strong> This will deploy a real smart contract to the blockchain.
                                Make sure all information is correct before proceeding. Gas fees will be required.
                            </p>
                        </div>

                        <form onSubmit={deployWrapSellContract}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Token Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={deployContractData.name}
                                        onChange={handleDeployContractChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Wrapped Charizard"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Token Symbol *
                                    </label>
                                    <input
                                        type="text"
                                        name="symbol"
                                        value={deployContractData.symbol}
                                        onChange={handleDeployContractChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., WCHAR"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Card ID *
                                    </label>
                                    <input
                                        type="number"
                                        name="cardId"
                                        value={deployContractData.cardId}
                                        onChange={handleDeployContractChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 4"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Card Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        value={deployContractData.cardName}
                                        onChange={handleDeployContractChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Charizard"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rarity *
                                    </label>
                                    <select
                                        name="rarity"
                                        value={deployContractData.rarity}
                                        onChange={handleDeployContractChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">-- Select Rarity --</option>
                                        <option value="Common">Common</option>
                                        <option value="Uncommon">Uncommon</option>
                                        <option value="Rare">Rare</option>
                                        <option value="Rare Holo">Rare Holo</option>
                                        <option value="Ultra Rare">Ultra Rare</option>
                                        <option value="Secret Rare">Secret Rare</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estimated Value Per Card (ETH) *
                                    </label>
                                    <input
                                        type="number"
                                        name="estimatedValuePerCard"
                                        value={deployContractData.estimatedValuePerCard}
                                        onChange={handleDeployContractChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 0.5"
                                        step="0.0001"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Associate to WrapPool (Optional)
                                    </label>
                                    <select
                                        name="wrapPoolAddress"
                                        value={deployContractData.wrapPoolAddress}
                                        onChange={handleDeployContractChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- No Pool --</option>
                                        {wrapPools.map(pool => (
                                            <option key={pool.contract_address} value={pool.contract_address}>
                                                {pool.name} ({pool.symbol}) - {pool.contract_address.substring(0, 8)}...
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Deploying Contract...' : '🚀 Deploy WrapSell Contract'}
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
                                                Card Owner
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

                    {/* Deployed WrapSell Contracts */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Deployed WrapSell Contracts</h2>

                        {wrapSellContracts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Token Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Symbol
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Card
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contract Address
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Value per Card
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Supply
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cards Deposited
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Transaction
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {wrapSellContracts.map((contract) => (
                                            <tr key={contract.contract_address}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {contract.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {contract.symbol}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>
                                                        <div className="font-medium">{contract.card_name}</div>
                                                        <div className="text-xs text-gray-400">ID: {contract.card_id} • {contract.rarity}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-mono">
                                                        {contract.contract_address.substring(0, 8)}...{contract.contract_address.substring(contract.contract_address.length - 6)}
                                                    </span>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(contract.contract_address)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                                                        title="Copy address"
                                                    >
                                                        📋
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(parseFloat(contract.estimated_value_per_card) / 10 ** 18).toFixed(4)} ETH
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(parseFloat(contract.total_supply) / 10 ** 18).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {contract.total_cards_deposited}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {contract.transaction_hash ? (
                                                        <a
                                                            href={`https://polygonscan.com/tx/${contract.transaction_hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="View on PolygonScan"
                                                        >
                                                            🔗 View
                                                        </a>
                                                    ) : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 italic text-lg mb-2">No WrapSell contracts deployed yet</p>
                                <p className="text-gray-400 text-sm">Deploy your first contract using the form above to get started!</p>
                            </div>
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