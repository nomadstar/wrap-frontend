
'use client';
import { useState } from 'react';
import { useAccount, useDisconnect, useConnectors } from 'wagmi';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useRouter } from 'next/navigation';
import {
    Wallet,
    Copy,
    ExternalLink,
    Settings,
    LogOut,
    CheckCircle,
    AlertCircle,
    Shield
} from 'lucide-react';
import Sidebar from '../../components/webcomponents/sidebar';
import Navbar from '../../components/webcomponents/Navbar';

export default function WalletPage() {
    const { address, isConnected, connector } = useAccount();
    const { isConnected: reownIsConnected } = useAppKitAccount();
    const { open } = useAppKit();
    const { disconnect } = useDisconnect();
    const router = useRouter();

    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            await disconnect();
            router.push('/');
        } catch (error) {
            console.error('Error disconnecting:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeWallet = () => {
        open();
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (!isConnected || !reownIsConnected) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-gray-50 flex items-center justify-center">
                    <div className="text-center max-w-md w-full mx-auto p-8">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Wallet className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Wallet Connected</h2>
                            <p className="text-gray-600 mb-6">
                                Connect your wallet to manage your account and view wallet details.
                            </p>
                            <button
                                onClick={() => open()}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <Wallet className="w-5 h-5" />
                                <span>Connect Wallet</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
                                <p className="text-gray-600 mt-1">Manage your connected wallet and account settings</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Wallet Status Card */}
                        <div className="bg-white rounded-xl shadow-sm mb-8">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                                    Wallet Connected
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Wallet Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Wallet Address
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <code className="bg-gray-100 px-3 py-2 rounded-lg font-mono text-sm flex-1">
                                                    {formatAddress(address || '')}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(address || '')}
                                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                                    title="Copy full address"
                                                >
                                                    {copied ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <a
                                                    href={`https://etherscan.io/address/${address}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                                    title="View on Etherscan"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Wallet Type
                                            </label>
                                            <div className="bg-gray-100 px-3 py-2 rounded-lg">
                                                {connector?.name || 'Unknown'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Connection Status
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-green-600 font-medium">Connected</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Info */}
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                                                        Security Notice
                                                    </h3>
                                                    <p className="text-sm text-blue-700">
                                                        You can only change wallets from this page.
                                                        Attempts to change wallets from other pages will redirect you to the home page.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                                                        Keep Connected
                                                    </h3>
                                                    <p className="text-sm text-yellow-700">
                                                        Your wallet must remain connected to access all features.
                                                        Disconnecting will redirect you to the home page.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={handleChangeWallet}
                                className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3"
                            >
                                <Settings className="w-5 h-5" />
                                <span>Change Wallet</span>
                            </button>

                            <button
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Disconnecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-5 h-5" />
                                        <span>Disconnect Wallet</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Full Address Display */}
                        <div className="mt-8 bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Full Address</h3>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm break-all">
                                    {address}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(address || '')}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy Full Address</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
