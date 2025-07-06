// components/UserProfile.tsx
"use client";

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useUser, useUserData, useIsAuthenticated } from '../context/UserContext';

export function UserProfile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isLoading, error, refetch } = useUser();
  const userData = useUserData();
  const isAuthenticated = useIsAuthenticated();

  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-gray-600">No hay wallet conectada</p>
        <w3m-button />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-blue-600">Creando/verificando usuario...</p>
        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mt-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg border-red-300 bg-red-50">
        <p className="text-red-600 mb-2">Error: {error}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return (
      <div className="p-4 border rounded-lg border-yellow-300 bg-yellow-50">
        <p className="text-yellow-700">Usuario no autenticado</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg border-green-300 bg-green-50">
      <h3 className="text-lg font-semibold text-green-800 mb-3">Usuario Autenticado</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong className="text-green-700">Wallet:</strong> 
          <span className="font-mono ml-2">{userData.wallet_address}</span>
        </div>
        
        <div>
          <strong className="text-green-700">Tipo:</strong> 
          <span className="ml-2">{userData.wallet_type}</span>
        </div>
        
        {userData.username && (
          <div>
            <strong className="text-green-700">Usuario:</strong> 
            <span className="ml-2">{userData.username}</span>
          </div>
        )}
        
        {userData.email && (
          <div>
            <strong className="text-green-700">Email:</strong> 
            <span className="ml-2">{userData.email}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Desconectar
        </button>
        
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
