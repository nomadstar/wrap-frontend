import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Loading from '../../components/webcomponents/loading';
import { poolsService, WrapPool } from '../../services/poolsService';

'use client';

const AdminPage = () => {
    const { address } = useAccount();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [wrapPools, setWrapPools] = useState<WrapPool[]>([]);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

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

    // Associate existing WrapSell form data
    const [associateData, setAssociateData] = useState({
        wrapSellAddress: '',
        poolAddress: '',
    });

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                setIsLoading(true);
                // This should be replaced with a real admin check from your service
                const adminStatus = await poolsService.checkAdminStatus(address || '');
                setIsAdmin(adminStatus);

                if (adminStatus) {
                    const pools = await poolsService.getWrapPools();
                    setWrapPools(pools);
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create New WrapSell Contract */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New WrapSell Contract</h2>
                        <form onSubmit={createNewWrapSell}>
                            <div className="space-y-4">
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

                                <div>
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

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating...' : 'Create WrapSell Contract'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Associate Existing WrapSell to Pool */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Associate Existing WrapSell to Pool</h2>
                        <form onSubmit={associateWrapSell}>
                            <div className="space-y-4">
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

                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Associating...' : 'Associate WrapSell to Pool'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Current Pools List */}
                <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
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
                                                {pool.associated_tokens ? pool.associated_tokens.length : 0} tokens
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
    );
};

export default AdminPage;