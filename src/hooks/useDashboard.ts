import { useState, useEffect } from 'react';
import { apiService, DashboardData, Pool, UserSummary } from '@/services/api';

export interface UseDashboardResult {
  dashboardData: DashboardData | null;
  pools: Pool[];
  userSummary: UserSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboard(walletAddress: string | null): UseDashboardResult {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard pools and user summary in parallel
      const [dashboardPools, summary] = await Promise.all([
        apiService.getDashboardPools(),
        apiService.getUserSummary(walletAddress).catch(() => null), // Allow user summary to fail
      ]);

      // Try to get user data, but don't fail if user doesn't exist
      let userData = null;
      try {
        userData = await apiService.getUser(walletAddress);
      } catch (userError) {
        console.warn('User not found, creating mock user data');
        userData = {
          wallet_address: walletAddress,
          wallet_type: 'ethereum',
          username: undefined,
          email: undefined,
        };
      }

      const data: DashboardData = {
        user: userData,
        pools: dashboardPools,
        summary: summary || {
          total_investment: 0,
          total_cards: 0,
          total_pools: 0,
          wallet_balance: 0,
          recent_activity: [],
        },
      };

      setDashboardData(data);
      setPools(dashboardPools);
      setUserSummary(data.summary);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [walletAddress]);

  return {
    dashboardData,
    pools,
    userSummary,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}

// Hook para obtener el balance de la wallet (mock por ahora)
export function useWalletBalance(walletAddress: string | null) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      // Por ahora usamos un valor mock
      // En el futuro se conectará con Web3 para obtener el balance real
      setBalance(2.3458);
    }
  }, [walletAddress]);

  return { balance, loading };
}

// Hook para formatear los datos de pools para el dashboard
export function useFormattedPools(pools: Pool[]) {
  return pools.map(pool => ({
    id: pool.id,
    name: pool.name,
    description: pool.description,
    value: pool.current_amount || 0,
    userInvestment: 0, // Se calculará basado en la participación del usuario
    investors: pool.investor_count || 0,
    daysActive: pool.days_active || 0,
    performance: pool.performance || '+0.0%',
    isPositive: pool.performance ? pool.performance.startsWith('+') : true,
    gradient: getPoolGradient(pool.id),
  }));
}

// Función helper para asignar gradientes a los pools
function getPoolGradient(poolId: number): string {
  const gradients = [
    'from-orange-500 to-red-600',
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-yellow-500 to-orange-600',
  ];
  
  return gradients[poolId % gradients.length];
}
