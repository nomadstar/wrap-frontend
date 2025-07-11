// API functions for user management

// Define User type
export interface User {
  id?: number;
  wallet_address: string;
  wallet_type: string;
  username: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

// API functions - replace with actual API calls
export const getUserByWallet = async (walletAddress: string): Promise<User> => {
  // Mock implementation - replace with actual API call
  throw new Error('User not found');
};

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  // Mock implementation - replace with actual API call
  return {
    id: Date.now(),
    ...userData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const fetchReownWallet = async (address: string): Promise<string> => {
  const REOWN_API_URL = process.env.NEXT_PUBLIC_REOWN_API_URL || "https://tu-backend-reown.com";
  const res = await fetch(`${REOWN_API_URL}/users/${address}`);
  if (!res.ok) throw new Error("No se pudo obtener la wallet de reown");
  const user = await res.json();
  return user.wallet_address;
};