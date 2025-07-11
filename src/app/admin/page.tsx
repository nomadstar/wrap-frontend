'use client';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Loading from '../../components/webcomponents/loading';
import Sidebar from '../../components/webcomponents/sidebar';
import { poolsService, WrapPool, Card, CreateMultipleWrapSellsData } from '../../services/poolsService';


const AdminPage = () => {
    const { address } = useAccount();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [wrapPools, setWrapPools] = useState<WrapPool[]>([]);
    const [availableCards, setAvailableCards] = useState<Card[]>([]);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'single' | 'multiple' | 'associate'>('multiple');

    // New WrapSell form data
    const [newWrapSell, setNewWrapSell] = useState({
        name: '',
        symbol: '',
        cardId: '',
        cardName: '',
        rarity: '',
        estimatedValuePerCard: '',
        poolAddress: '',
    });

    // Multiple WrapSells creation data
    const [multipleWrapSells, setMultipleWrapSells] = useState<CreateMultipleWrapSellsData>({
        poolAddress: '',
        selectedCards: [],
        tokenPrefix: '',
        symbolPrefix: '',
    });

    // Associate existing WrapSell form data
    const [associateData, setAssociateData] = useState({
        wrapSellAddress: '',
        poolAddress: '',
    });

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                setIsLoading(true);
                const adminStatus = await poolsService.checkAdminStatus(address || '');
                setIsAdmin(adminStatus);

                if (adminStatus) {
                    const [pools, cards] = await Promise.all([
                        poolsService.getWrapPools(),
                        poolsService.getAllAvailableCards()
                    ]);
                    setWrapPools(pools);
                    setAvailableCards(cards);
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

    const handleNewWrapSellChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewWrapSell(prev => ({ ...prev, [name]: value }));
    };

    const handleMultipleWrapSellsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setMultipleWrapSells(prev => ({ ...prev, [name]: value }));
    };

    const handleCardSelection = (cardId: number) => {
        setMultipleWrapSells(prev => ({
            ...prev,
            selectedCards: prev.selectedCards.includes(cardId)
                ? prev.selectedCards.filter(id => id !== cardId)
                : [...prev.selectedCards, cardId]
        }));
    };

    const handleAssociateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAssociateData(prev => ({ ...prev, [name]: value }));
    };

    const createNewWrapSell = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Convert values to appropriate types
            const createData = {
                ...newWrapSell,
                cardId: parseInt(newWrapSell.cardId),
                estimatedValuePerCard: parseFloat(newWrapSell.estimatedValuePerCard),
            };

            // Call service to create WrapSell contract
            const result = await poolsService.createWrapSell(createData);
            setSuccessMessage(`WrapSell contract created successfully! Contract address: ${result.contractAddress}`);

            // Reset form
            setNewWrapSell({
                name: '',
                symbol: '',
                cardId: '',
                cardName: '',
                rarity: '',
                estimatedValuePerCard: '',
                poolAddress: '',
            });

            // Refresh pools data
            const pools = await poolsService.getWrapPools();
            setWrapPools(pools);
        } catch (err) {
            console.error('Error creating WrapSell contract:', err);
            setError('Failed to create WrapSell contract. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const associateWrapSell = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Call service to associate WrapSell with pool
            await poolsService.associateWrapSellToPool(
                associateData.wrapSellAddress,
                associateData.poolAddress
            );

            setSuccessMessage('WrapSell contract successfully associated with pool!');

            // Reset form
            setAssociateData({
                wrapSellAddress: '',
                poolAddress: '',
            });

            // Refresh pools data
            const pools = await poolsService.getWrapPools();
            setWrapPools(pools);
        } catch (err) {
            console.error('Error associating WrapSell contract:', err);
            setError('Failed to associate WrapSell contract. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const createMultipleWrapSells = async (e: React.FormEvent) => {
        e.preventDefault();
        if (multipleWrapSells.selectedCards.length === 0) {
            setError('Please select at least one card to create WrapSells');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const result = await poolsService.createMultipleWrapSells(multipleWrapSells);
            setSuccessMessage(`Successfully created ${result.contracts.length} WrapSell contracts!`);

            // Reset form
            setMultipleWrapSells({
                poolAddress: '',
                selectedCards: [],
                tokenPrefix: '',
                symbolPrefix: '',
            });

            // Refresh pools data
            const pools = await poolsService.getWrapPools();
            setWrapPools(pools);
        } catch (err) {
            console.error('Error creating multiple WrapSell contracts:', err);
            setError('Failed to create WrapSell contracts. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-700 mb-6">
                        You don't have permission to access the admin area. Please connect with an admin wallet.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard - WrapSell Token Generator</h1>

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

                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <nav className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('multiple')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'multiple'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Create Multiple Tokens
                            </button>
                            <button
                                onClick={() => setActiveTab('single')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'single'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Create Single Token
                            </button>
                            <button
                                onClick={() => setActiveTab('associate')}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'associate'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Associate Token to Pool
                            </button>
                        </nav>
                    </div>

                    {/* Multiple WrapSells Generator */}
                    {activeTab === 'multiple' && (
                        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Multiple WrapSell Token Generator</h2>
                            <form onSubmit={createMultipleWrapSells}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Configuration Panel */}
                                    <div className="lg:col-span-1">
                                        <h3 className="text-lg font-medium text-gray-700 mb-4">Configuration</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Associate to Pool
                                                </label>
                                                <select
                                                    name="poolAddress"
                                                    value={multipleWrapSells.poolAddress}
                                                    onChange={handleMultipleWrapSellsChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="">-- Select a Pool --</option>
                                                    {wrapPools.map(pool => (
                                                        <option key={pool.contract_address} value={pool.contract_address}>
                                                            {pool.name} ({pool.symbol})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Token Name Prefix (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="tokenPrefix"
                                                    value={multipleWrapSells.tokenPrefix}
                                                    onChange={handleMultipleWrapSellsChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Wrapped"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Symbol Prefix (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="symbolPrefix"
                                                    value={multipleWrapSells.symbolPrefix}
                                                    onChange={handleMultipleWrapSellsChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., W"
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <div className="text-sm text-gray-600 mb-2">
                                                    Selected Cards: {multipleWrapSells.selectedCards.length}
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                                    disabled={isLoading || multipleWrapSells.selectedCards.length === 0}
                                                >
                                                    {isLoading ? 'Creating Tokens...' : 'Create WrapSell Tokens'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Selection Panel */}
                                    <div className="lg:col-span-2">
                                        <h3 className="text-lg font-medium text-gray-700 mb-4">Select Cards</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                            {availableCards.map(card => (
                                                <div
                                                    key={card.id}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${multipleWrapSells.selectedCards.includes(card.id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                    onClick={() => handleCardSelection(card.id)}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium text-gray-900 truncate">{card.name}</h4>
                                                        <input
                                                            type="checkbox"
                                                            checked={multipleWrapSells.selectedCards.includes(card.id)}
                                                            onChange={() => handleCardSelection(card.id)}
                                                            className="ml-2"
                                                        />
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <div>ID: {card.card_id}</div>
                                                        <div>Edition: {card.edition}</div>
                                                        <div className="font-medium text-green-600">
                                                            ${card.market_value.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Single WrapSell Creator */}
                    {activeTab === 'single' && (
                        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Single WrapSell Contract</h2>
                            <form onSubmit={createNewWrapSell}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Token Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newWrapSell.name}
                                            onChange={handleNewWrapSellChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Token Symbol
                                        </label>
                                        <input
                                            type="text"
                                            name="symbol"
                                            value={newWrapSell.symbol}
                                            onChange={handleNewWrapSellChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Card ID
                                        </label>
                                        <input
                                            type="number"
                                            name="cardId"
                                            value={newWrapSell.cardId}
                                            onChange={handleNewWrapSellChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Card Name
                                        </label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={newWrapSell.cardName}
                                            onChange={handleNewWrapSellChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rarity
                                        </label>
                                        <input
                                            type="text"
                                            name="rarity"
                                            value={newWrapSell.rarity}
                                            onChange={handleNewWrapSellChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Value Per Card (ETH)
                                        </label>
                                        <input
                                            type="number"
                                            name="estimatedValuePerCard"
                                            value={newWrapSell.estimatedValuePerCard}
                                            onChange={handleNewWrapSellChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            step="0.000001"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Associate to Pool (Optional)
                                        </label>
                                        <select
                                            name="poolAddress"
                                            value={newWrapSell.poolAddress}
                                            onChange={handleNewWrapSellChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Select a Pool --</option>
                                            {wrapPools.map(pool => (
                                                <option key={pool.contract_address} value={pool.contract_address}>
                                                    {pool.name} ({pool.symbol})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Creating...' : 'Create WrapSell Contract'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Associate Existing WrapSell to Pool */}
                    {activeTab === 'associate' && (
                        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Associate Existing WrapSell to Pool</h2>
                            <form onSubmit={associateWrapSell}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            WrapSell Contract Address
                                        </label>
                                        <input
                                            type="text"
                                            name="wrapSellAddress"
                                            value={associateData.wrapSellAddress}
                                            onChange={handleAssociateChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0x..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pool to Associate With
                                        </label>
                                        <select
                                            name="poolAddress"
                                            value={associateData.poolAddress}
                                            onChange={handleAssociateChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">-- Select a Pool --</option>
                                            {wrapPools.map(pool => (
                                                <option key={pool.contract_address} value={pool.contract_address}>
                                                    {pool.name} ({pool.symbol})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Associating...' : 'Associate WrapSell to Pool'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Current Pools List */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Wrap Pools</h2>

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
                                                Associated Tokens
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {wrapPools.map((pool) => (
                                            <tr key={pool.contract_address}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pool.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pool.symbol}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-mono">{pool.contract_address.substring(0, 8)}...{pool.contract_address.substring(pool.contract_address.length - 6)}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {pool.total_wrapsells || 0} tokens
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
        </div>
    );
};

export default AdminPage;