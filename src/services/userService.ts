// services/userService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'your_secret_key';

export interface CreateUserData {
  wallet_address: string;
  wallet_type: string;
  username?: string;
  email?: string;
}

export interface UserResponse {
  wallet_address: string;
  wallet_type: string;
  username?: string;
  email?: string;
}

export class UserService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error in API request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  static async createUser(userData: CreateUserData): Promise<UserResponse> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Obtener un usuario por wallet address
  static async getUser(walletAddress: string): Promise<UserResponse | null> {
    try {
      return await this.makeRequest(`/users/${walletAddress}`);
    } catch (error) {
      // Si el usuario no existe, retornamos null en lugar de lanzar error
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Crear usuario si no existe (función helper)
  static async createUserIfNotExists(walletAddress: string, walletType: string = 'ethereum'): Promise<UserResponse> {
    try {
      // Primero verificar si el usuario ya existe
      const existingUser = await this.getUser(walletAddress);
      if (existingUser) {
        console.log('Usuario ya existe:', existingUser);
        return existingUser;
      }

      // Si no existe, crear nuevo usuario
      const newUser = await this.createUser({
        wallet_address: walletAddress,
        wallet_type: walletType,
      });
      
      console.log('Nuevo usuario creado:', newUser);
      return newUser;
    } catch (error) {
      console.error('Error al crear/verificar usuario:', error);
      throw error;
    }
  }
}
