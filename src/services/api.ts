import { useState, useEffect } from 'react';

// API Service para WrapSell
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'your_secret_key';

// Configuración base para las peticiones
const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
};

// Interfaces TypeScript
export interface User {
  wallet_address: string;
  wallet_type: string;
  username?: string;
  email?: string;
  created_at?: string;
}

export interface Card {
  id: number;
  name: string;
  edition: string;
  number: string;
  price: number;
  image_url?: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface Pool {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  card_count: number;
  investor_count: number;
  created_at: string;
  performance?: string;
  days_active?: number;
}

export interface UserSummary {
  total_investment: number;
  total_cards: number;
  total_pools: number;
  wallet_balance?: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  amount: number;
  timestamp: string;
}

export interface DashboardData {
  user: User;
  pools: Pool[];
  summary: UserSummary;
}

// Clase para manejar las peticiones a la API
class ApiService {
  private async fetch(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...apiConfig.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos para usuarios
  async createUser(userData: Omit<User, 'created_at'>): Promise<User> {
    return this.fetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(walletAddress: string): Promise<User> {
    return this.fetch(`/users/${walletAddress}`);
  }

  async getUserCards(walletAddress: string): Promise<Card[]> {
    return this.fetch(`/users/${walletAddress}/cards`);
  }

  // Métodos para cartas
  async getAllCards(): Promise<Card[]> {
    return this.fetch('/cards');
  }

  async getCard(cardId: number): Promise<Card> {
    return this.fetch(`/cards/${cardId}`);
  }

  async addCardByUrl(url: string, walletAddress: string): Promise<Card> {
    return this.fetch('/cards/add-by-url', {
      method: 'POST',
      body: JSON.stringify({ url, wallet_address: walletAddress }),
    });
  }

  async updatePrices(): Promise<{ message: string }> {
    return this.fetch('/update_prices', {
      method: 'POST',
    });
  }

  // Métodos para pools
  async getAllPools(): Promise<Pool[]> {
    return this.fetch('/pools');
  }

  async getDashboardPools(): Promise<Pool[]> {
    return this.fetch('/dashboard/pools');
  }

  async createPool(poolData: {
    name: string;
    description: string;
    target_amount: number;
    card_ids: number[];
  }): Promise<Pool> {
    return this.fetch('/pools', {
      method: 'POST',
      body: JSON.stringify(poolData),
    });
  }

  // Métodos para dashboard
  async getUserSummary(walletAddress: string): Promise<UserSummary> {
    return this.fetch(`/dashboard/user/${walletAddress}/summary`);
  }

  async getDashboardData(walletAddress: string): Promise<DashboardData> {
    try {
      const [user, pools, summary] = await Promise.all([
        this.getUser(walletAddress),
        this.getDashboardPools(),
        this.getUserSummary(walletAddress),
      ]);

      return {
        user,
        pools,
        summary,
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Método para obtener el valor total
  async getTotalValue(): Promise<{ total_value: number }> {
    return this.fetch('/total_value');
  }
}

// Instancia singleton del servicio
export const apiService = new ApiService();

// Hook personalizado para manejar el estado de carga
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const executeApiCall = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    executeApiCall();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

export default apiService;
