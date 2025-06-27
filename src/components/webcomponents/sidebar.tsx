'use client';
import React, { useState } from 'react';

interface SidebarProps {
    children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <div
                className={`bg-gray-800 text-white h-full transition-all duration-300 ease-in-out ${
                    isOpen ? 'w-64' : 'w-16'
                }`}
            >
                {/* Toggle Button */}
                <div className="p-4 border-b border-gray-700">
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex items-center justify-center p-2 rounded hover:bg-gray-700 transition-colors"
                    >
                        <svg
                            className={`w-6 h-6 transition-transform duration-300 ${
                                isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                            />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="p-4">
                    {isOpen ? (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Menu</h2>
                            {children || (
                                <nav>
                                    <ul className="space-y-2">
                                        <li>
                                            <a href="dashboard" className="block p-2 rounded hover:bg-gray-700">
                                                Dashboard
                                            </a>
                                        </li>
                                         <li>
                                            <a href="mypools" className="block p-2 rounded hover:bg-gray-700">
                                                My Pools
                                            </a>
                                        </li>
                                        <li>
                                            <a href="settings" className="block p-2 rounded hover:bg-gray-700">
                                                Settings
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="block p-2 rounded hover:bg-gray-700">
                                                Stats
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-8 h-8 bg-gray-600 rounded"></div>
                            <div className="w-8 h-8 bg-gray-600 rounded"></div>
                            <div className="w-8 h-8 bg-gray-600 rounded"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;