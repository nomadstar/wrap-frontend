'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Loading from '../../components/webcomponents/loading';
import Navbar from '../../components/webcomponents/Navbar';
import { useWalletRedirect } from '../../hooks/useWalletRedirect';
import { poolsService, WrapPool } from '../../services/poolsService';
import { fetchReownWallet } from '../api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wrapsell-backend-e9c344d91fb8.herokuapp.com';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Interfaces
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
    total_supply: string;
    total_cards_deposited: number;
    transaction_hash?: string;
    created_at: string;
}

// Componente para mostrar mensajes de estado
const StatusMessage = ({ message, type }: { message: string; type: 'error' | 'success' }) => (
    <div className={`${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded-lg mb-6`}>
        {message}
    </div>
);

// Componente para formulario de agregar carta
const AddCardForm = ({
    onSubmit,
    data,
    onChange,
    wrapPools,
    isLoading
}: {
    onSubmit: (e: React.FormEvent) => void;
    data: { url: string; poolId: string };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    wrapPools: WrapPool[];
    isLoading: boolean;
}) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Card by PriceCharting URL</h2>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">
                <strong>Instructions:</strong> Provide a valid PriceCharting.com URL for a Pokémon TCG card.
            </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    PriceCharting.com URL *
                </label>
                <input
                    type="url"
                    name="url"
                    value={data.url}
                    onChange={onChange}
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
                    value={data.poolId}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a pool (optional)</option>
                    {wrapPools.map((pool) => (
                        <option key={pool.id} value={pool.id}>
                            {pool.name} ({pool.symbol})
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
            >
                {isLoading ? 'Adding Card...' : 'Add Card from URL'}
            </button>
        </form>
    </div>
);

// Componente para formulario de deployment
const DeployContractForm = ({
    onSubmit,
    data,
    onChange,
    wrapPools,
    isLoading
}: {
    onSubmit: (e: React.FormEvent) => void;
    data: { url: string; wrapPoolAddress: string };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    wrapPools: WrapPool[];
    isLoading: boolean;
}) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Deploy WrapSell Contract</h2>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">
                <strong>⚠️ Warning:</strong> This will deploy a real contract on the blockchain. Gas fees required.
            </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    PriceCharting.com URL *
                </label>
                <input
                    type="url"
                    name="url"
                    value={data.url}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://www.pricecharting.com/game/pokemon-..."
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Associate to WrapPool (Optional)
                </label>
                <select
                    name="wrapPoolAddress"
                    value={data.wrapPoolAddress}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">Select a pool (optional)</option>
                    {wrapPools.map((pool) => (
                        <option key={pool.contract_address} value={pool.contract_address}>
                            {pool.name} ({pool.symbol})
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
            >
                {isLoading ? 'Deploying Contract...' : '🚀 Deploy WrapSell Contract'}
            </button>
        </form>
    </div>
);

// Componente para tabla de cartas
const CardsTable = ({ cards }: { cards: Card[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Cards</h2>
        {cards.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Name', 'Edition', 'Card ID', 'Market Value', 'Owner', 'Pool', 'Source'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cards.slice(0, 20).map((card) => (
                            <tr key={card.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{card.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.edition}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.card_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(card.market_value || 0).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {card.user_wallet ? `${card.user_wallet.substring(0, 6)}...${card.user_wallet.substring(card.user_wallet.length - 4)}` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.pool_id ? `Pool ${card.pool_id}` : 'None'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {card.url && (
                                        <a href={card.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                            View Source
                                        </a>
                                    )}
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
);

// Componente para tabla de contratos
const ContractsTable = ({ contracts }: { contracts: WrapSellContract[] }) => (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Deployed WrapSell Contracts</h2>
        {contracts.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Token', 'Symbol', 'Card', 'Contract', 'Value/Card', 'Supply', 'Transaction'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contracts.map((contract) => (
                            <tr key={contract.contract_address}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.symbol}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="font-medium">{contract.card_name}</div>
                                    <div className="text-xs text-gray-400">ID: {contract.card_id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="font-mono">
                                        {contract.contract_address.substring(0, 8)}...{contract.contract_address.substring(contract.contract_address.length - 6)}
                                    </span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(contract.contract_address)}
                                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
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
                                    {contract.transaction_hash && (
                                        <a
                                            href={`https://polygonscan.com/tx/${contract.transaction_hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            🔗 View
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-8">
                <p className="text-gray-500 italic text-lg mb-2">No contracts deployed yet</p>
                <p className="text-gray-400 text-sm">Deploy your first contract to get started!</p>
            </div>
        )}
    </div>
);

// Hook personalizado para manejo de datos
const useAdminData = (isAdmin: boolean, address: string | undefined) => {
    const [data, setData] = useState({
        cards: [] as Card[],
        contracts: [] as WrapSellContract[],
        pools: [] as WrapPool[],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        if (!isAdmin) return;

        setLoading(true);
        try {
            const [pools, cards, contracts] = await Promise.all([
                poolsService.getWrapPools(),
                fetch(`${API_BASE_URL}/cards`, {
                    headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY }
                }).then(res => res.json()),
                fetch(`${API_BASE_URL}/contracts/wrapsell`, {
                    headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY }
                }).then(res => res.json())
            ]);

            setData({ pools, cards, contracts });
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const submitCard = async (formData: { url: string; poolId: string }) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!formData.url || !address) {
                throw new Error('URL and wallet connection required');
            }

            if (!formData.url.includes('pricecharting.com')) {
                throw new Error('Please provide a valid PriceCharting.com URL');
            }

            const reownWallet = await fetchReownWallet(address);
            const response = await fetch(`${API_BASE_URL}/cards_admin/add-by-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
                body: JSON.stringify({
                    admin_wallet: reownWallet,
                    url: formData.url.trim(),
                    user_wallet: reownWallet,
                    pool_id: formData.poolId ? parseInt(formData.poolId) : null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setSuccess(`Card added successfully! Card ID: ${result.card_id}`);
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add card');
        } finally {
            setLoading(false);
        }
    };

    const deployContract = async (formData: { url: string; wrapPoolAddress: string }) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!formData.url || !address) {
                throw new Error('URL and wallet connection required');
            }

            if (!formData.url.includes('pricecharting.com')) {
                throw new Error('Please provide a valid PriceCharting.com URL');
            }

            const response = await fetch(`${API_BASE_URL}/contracts/wrapsell/deploy-by-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
                body: JSON.stringify({
                    admin_wallet: address,
                    url: formData.url.trim(),
                    wrap_pool_address: formData.wrapPoolAddress || null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setSuccess(`Contract deployed successfully!\nAddress: ${result.contract_address}`);
            await fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to deploy contract');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

    return { data, loading, error, success, submitCard, deployContract };
};

// Componente principal simplificado
const AdminPage = () => {
    const { isWalletConnected } = useWalletRedirect();
    const { address } = useAccount();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [addCardData, setAddCardData] = useState({ url: '', poolId: '' });
    const [deployData, setDeployData] = useState({ url: '', wrapPoolAddress: '' });

    const { data, loading, error, success, submitCard, deployContract } = useAdminData(isAdmin, address);

    // Verificar admin
    useEffect(() => {
        const checkAdmin = async () => {
            console.log('🔍 Checking admin status for wallet:', address);
            if (!address) {
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }
            try {
                // Usar el servicio poolsService que tiene fallback para wallets hardcodeadas
                const adminStatus = await poolsService.checkAdminStatus(address);
                console.log('📋 Admin status from service:', adminStatus);

                setIsAdmin(adminStatus);
                setIsLoading(false);
                console.log('✅ State updated - isAdmin:', adminStatus);

            } catch (error) {
                console.log('❌ Admin check error:', error);
                setIsAdmin(false);
                setIsLoading(false);
            }
        };
        checkAdmin();
    }, [address]);

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitCard(addCardData);
        setAddCardData({ url: '', poolId: '' });
    };

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        await deployContract(deployData);
        setDeployData({ url: '', wrapPoolAddress: '' });
    };

    if (isLoading) return <Loading />;

    if (!address || !isAdmin) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                        <p className="text-gray-700 mb-6">
                            {!address ? 'Please connect your wallet' : 'You don\'t have admin permission'}
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
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
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <div className="text-sm text-gray-600">
                            Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                        </div>
                    </div>

                    {error && <StatusMessage message={error} type="error" />}
                    {success && <StatusMessage message={success} type="success" />}

                    <AddCardForm
                        onSubmit={handleAddCard}
                        data={addCardData}
                        onChange={(e) => setAddCardData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        wrapPools={data.pools}
                        isLoading={loading}
                    />

                    <DeployContractForm
                        onSubmit={handleDeploy}
                        data={deployData}
                        onChange={(e) => setDeployData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        wrapPools={data.pools}
                        isLoading={loading}
                    />

                    <CardsTable cards={data.cards} />
                    <ContractsTable contracts={data.contracts} />
                </div>
            </div>
        </>
    );
};

export default AdminPage;