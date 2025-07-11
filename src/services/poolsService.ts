// Servicio para interactuar con las APIs de pools y contratos
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'development-key';

interface WrapPool {
  id: number;
  contract_address: string;
  name: string;
  symbol: string;
  owner_wallet: string;
  collateralization_ratio: number;
  total_supply: string;
  total_collateral_value: string;
  is_healthy: boolean;
  created_at: string;
  updated_at: string;
  total_wrapsells?: number;
  total_cards?: number;
}

interface WrapSell {
  id: number;
  contract_address: string;
  name: string;
  symbol: string;
  card_id: number;
  card_name: string;
  rarity: string;
  estimated_value_per_card: string;
  owner_wallet: string;
  wrap_pool_address: string;
  total_supply: string;
  total_cards_deposited: number;
  total_tokens_issued: string;
  created_at: string;
  updated_at: string;
  pool_name?: string;
  pool_symbol?: string;
}

interface CardDeposit {
  id: number;
  wrap_sell_address: string;
  user_wallet: string;
  cards_deposited: number;
  tokens_received: string;
  deposit_value: string;
  created_at: string;
  updated_at: string;
}

interface PriceHistoryPoint {
  date: string;
  value: number;
}

interface TCGCardData {
  id: string;
  name: string;
  imageUrl: string;
  tcgName: string;
  marketValue: number;
  rarity: string;
  condition: string;
  set: string;
  priceHistory: PriceHistoryPoint[];
}

interface Card {
  id: number;
  name: string;
  card_id: string;
  edition: string;
  market_value: number;
  url?: string;
  pool_id?: number;
  created_at: string;
}

interface CreateWrapSellData {
  name: string;
  symbol: string;
  cardId: number;
  cardName: string;
  rarity: string;
  estimatedValuePerCard: number;
  poolAddress?: string;
}

interface CreateMultipleWrapSellsData {
  poolAddress: string;
  selectedCards: number[];
  tokenPrefix?: string;
  symbolPrefix?: string;
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

class PoolsService {
  
  /**
   * Obtener todos los WrapPools
   */
  async getWrapPools(): Promise<WrapPool[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/wrap-pools`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching wrap pools:', error);
      return this.getMockWrapPools();
    }
  }

  /**
   * Obtener todos los WrapSells
   */
  async getWrapSells(): Promise<WrapSell[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/wrap-sells`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching wrap sells:', error);
      return this.getMockWrapSells();
    }
  }

  /**
   * Obtener depósitos de cartas por usuario
   */
  async getUserCardDeposits(userWallet: string): Promise<CardDeposit[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/card-deposits/${userWallet}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user card deposits:', error);
      return [];
    }
  }

  /**
   * Convertir WrapSells a formato TCGCardData
   */
  wrapSellsToTCGCards(wrapSells: WrapSell[]): TCGCardData[] {
    return wrapSells.map(sell => ({
      id: sell.id.toString(),
      name: sell.card_name,
      imageUrl: `https://images.pokemontcg.io/base1/${sell.card_id}_hires.png`, // URL por defecto
      tcgName: this.getTCGNameFromPool(sell.pool_name || ''),
      marketValue: parseFloat(sell.estimated_value_per_card) / Math.pow(10, 18), // Convertir de wei
      rarity: sell.rarity,
      condition: 'Near Mint', // Valor por defecto
      set: 'Alpha', // Valor por defecto
      priceHistory: this.generateMockPriceHistory(parseFloat(sell.estimated_value_per_card) / Math.pow(10, 18)),
    }));
  }

  /**
   * Obtener estadísticas de un pool específico
   */
  async getPoolStats(poolAddress: string) {
    try {
      const [pools, sells] = await Promise.all([
        this.getWrapPools(),
        this.getWrapSells()
      ]);

      const pool = pools.find(p => p.contract_address === poolAddress);
      const poolSells = sells.filter(s => s.wrap_pool_address === poolAddress);

      if (!pool) {
        throw new Error('Pool no encontrado');
      }

      const tcgCards = this.wrapSellsToTCGCards(poolSells);
      const totalValue = tcgCards.reduce((sum, card) => sum + card.marketValue, 0);
      
      const highestValueCard = tcgCards.reduce((max, card) => 
        card.marketValue > max.marketValue ? card : max, tcgCards[0]);
      
      const lowestValueCard = tcgCards.reduce((min, card) => 
        card.marketValue < min.marketValue ? card : min, tcgCards[0]);

      return {
        pool,
        tcgCards,
        totalValue,
        highestValueCard,
        lowestValueCard,
        totalCards: tcgCards.length,
        priceHistory: this.generateMockPriceHistory(totalValue),
      };
    } catch (error) {
      console.error('Error fetching pool stats:', error);
      return null;
    }
  }

  /**
   * Verificar si una dirección es administrador
   */
  async isAdmin(walletAddress: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify/${walletAddress}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.isAdmin || false;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return false;
    }
  }

  /**
   * Verificar si una wallet es administradora
   */
  async checkAdminStatus(walletAddress: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking admin status for wallet: ${walletAddress}`);
      const response = await fetch(`${API_BASE_URL}/admin/check/${walletAddress}`, {
        method: 'GET',
        headers,
      });
      
      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to check admin status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📋 Admin check response:`, data);
      return data.is_admin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      
      // Fallback: verificar si es la wallet hardcodeada del script de migración
      const hardcodedAdmins = [
        '0xEf4dE33f51a75C0d3Dfa5e8B0B23370f0B3B6a87',
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      ];
      
      const isHardcodedAdmin = hardcodedAdmins.some(admin => 
        walletAddress.toLowerCase() === admin.toLowerCase()
      );
      
      if (isHardcodedAdmin) {
        console.log('🔧 Using hardcoded admin fallback for wallet:', walletAddress);
        return true;
      }
      
      console.log('❌ Wallet not authorized as admin:', walletAddress);
      return false;
    }
  }

  /**
   * Función adicional para obtener datos completos del admin
   */
  async getAdminData(walletAddress: string): Promise<any> {
    try {
      const response = await fetch(`/api/admin/check?wallet=${walletAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to get admin data');
      }
      
      const data = await response.json();
      return data.adminData;
    } catch (error) {
      console.error('Error getting admin data:', error);
      throw error;
    }
  }

  /**
   * Obtener cartas disponibles para un pool específico
   */
  async getAvailableCards(poolAddress: string): Promise<Card[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/available-cards/${poolAddress}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available cards:', error);
      return [];
    }
  }

  /**
   * Obtener todas las cartas disponibles para crear WrapSells
   */
  async getAllAvailableCards(): Promise<Card[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cards`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all available cards:', error);
      return this.getMockCards();
    }
  }

  /**
   * Crear un contrato WrapSell individual
   */
  async createWrapSell(data: CreateWrapSellData): Promise<{ contractAddress: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/wrap-sells/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating WrapSell contract:', error);
      // Retornar una dirección mock para desarrollo
      return {
        contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`
      };
    }
  }

  /**
   * Crear múltiples contratos WrapSell de una vez
   */
  async createMultipleWrapSells(data: CreateMultipleWrapSellsData): Promise<{ contracts: Array<{ cardId: number; contractAddress: string; cardName: string }> }> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/wrap-sells/create-multiple`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating multiple WrapSell contracts:', error);
      // Simular creación múltiple para desarrollo
      const availableCards = await this.getAllAvailableCards();
      const mockResults = data.selectedCards.map(cardId => {
        const card = availableCards.find(c => c.id === cardId);
        return {
          cardId,
          contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          cardName: card?.name || `Card ${cardId}`
        };
      });
      return { contracts: mockResults };
    }
  }

  /**
   * Asociar un WrapSell existente a un pool
   */
  async associateWrapSellToPool(wrapSellAddress: string, poolAddress: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/wrap-sells/associate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          wrapSellAddress,
          poolAddress
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error associating WrapSell to pool:', error);
      throw error;
    }
  }

  /**
   * Funciones auxiliares
   */
  private getTCGNameFromPool(poolName: string): string {
    if (poolName.toLowerCase().includes('pokemon')) return 'Pokemon';
    if (poolName.toLowerCase().includes('yugioh') || poolName.toLowerCase().includes('yu-gi-oh')) return 'Yu-Gi-Oh!';
    if (poolName.toLowerCase().includes('magic')) return 'Magic: The Gathering';
    return 'Trading Card Game';
  }

  private generateMockPriceHistory(baseValue: number): PriceHistoryPoint[] {
    const history: PriceHistoryPoint[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const value = baseValue * (1 + variation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }

    return history;
  }

  /**
   * Datos mock de fallback cuando la API no está disponible
   */
  private getMockWrapPools(): WrapPool[] {
    return [
      {
        id: 1,
        contract_address: '0x1111111111111111111111111111111111111111',
        name: 'Pokemon Stable Pool',
        symbol: 'PSP',
        owner_wallet: '0xowner1111111111111111111111111111111111111',
        collateralization_ratio: 150,
        total_supply: '50000000000000000000000',
        total_collateral_value: '75000000000000000000000',
        is_healthy: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_wrapsells: 3,
        total_cards: 150,
      },
      {
        id: 2,
        contract_address: '0x2222222222222222222222222222222222222222',
        name: 'Yu-Gi-Oh Stable Pool',
        symbol: 'YSP',
        owner_wallet: '0xowner2222222222222222222222222222222222222',
        collateralization_ratio: 120,
        total_supply: '30000000000000000000000',
        total_collateral_value: '36000000000000000000000',
        is_healthy: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_wrapsells: 2,
        total_cards: 85,
      }
    ];
  }

  private getMockWrapSells(): WrapSell[] {
    return [
      {
        id: 1,
        contract_address: '0xsell1111111111111111111111111111111111111',
        name: 'Black Lotus Wrapper',
        symbol: 'BLW',
        card_id: 1,
        card_name: 'Black Lotus',
        rarity: 'Rare',
        estimated_value_per_card: '25000000000000000000000',
        owner_wallet: '0xowner1111111111111111111111111111111111111',
        wrap_pool_address: '0x1111111111111111111111111111111111111111',
        total_supply: '1000000000000000000',
        total_cards_deposited: 1,
        total_tokens_issued: '1000000000000000000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pool_name: 'Magic Stable Pool',
        pool_symbol: 'MSP',
      },
      {
        id: 2,
        contract_address: '0xsell2222222222222222222222222222222222222',
        name: 'Ancestral Recall Wrapper',
        symbol: 'ARW',
        card_id: 2,
        card_name: 'Ancestral Recall',
        rarity: 'Rare',
        estimated_value_per_card: '8500000000000000000000',
        owner_wallet: '0xowner1111111111111111111111111111111111111',
        wrap_pool_address: '0x1111111111111111111111111111111111111111',
        total_supply: '500000000000000000',
        total_cards_deposited: 1,
        total_tokens_issued: '500000000000000000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pool_name: 'Magic Stable Pool',
        pool_symbol: 'MSP',
      }
    ];
  }

  /**
   * Datos mock de cartas para desarrollo
   */
  private getMockCards(): Card[] {
    return [
      {
        id: 1,
        name: 'Charizard',
        card_id: '4',
        edition: 'Base Set',
        market_value: 350.00,
        url: 'https://www.pricecharting.com/game/pokemon-base-set/charizard-4',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Blastoise',
        card_id: '2',
        edition: 'Base Set',
        market_value: 280.00,
        url: 'https://www.pricecharting.com/game/pokemon-base-set/blastoise-2',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Venusaur',
        card_id: '15',
        edition: 'Base Set',
        market_value: 200.00,
        url: 'https://www.pricecharting.com/game/pokemon-base-set/venusaur-15',
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'Pikachu',
        card_id: '58',
        edition: 'Base Set',
        market_value: 125.00,
        url: 'https://www.pricecharting.com/game/pokemon-base-set/pikachu-58',
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        name: 'Milotic Ex',
        card_id: '96',
        edition: 'Pokemon Emerald',
        market_value: 131.57,
        url: 'https://www.pricecharting.com/game/pokemon-emerald/milotic-ex-96',
        created_at: new Date().toISOString(),
      },
      {
        id: 6,
        name: 'Blue-Eyes White Dragon',
        card_id: 'LOB-001',
        edition: 'Legend of Blue Eyes',
        market_value: 450.00,
        url: 'https://www.pricecharting.com/game/yugioh-legend-of-blue-eyes/blue-eyes-white-dragon',
        created_at: new Date().toISOString(),
      },
      {
        id: 7,
        name: 'Dark Magician',
        card_id: 'LOB-005',
        edition: 'Legend of Blue Eyes',
        market_value: 180.00,
        url: 'https://www.pricecharting.com/game/yugioh-legend-of-blue-eyes/dark-magician',
        created_at: new Date().toISOString(),
      },
      {
        id: 8,
        name: 'Red-Eyes Black Dragon',
        card_id: 'LOB-070',
        edition: 'Legend of Blue Eyes',
        market_value: 95.00,
        url: 'https://www.pricecharting.com/game/yugioh-legend-of-blue-eyes/red-eyes-black-dragon',
        created_at: new Date().toISOString(),
      }
    ];
  }
}

export const poolsService = new PoolsService();
export type { WrapPool, WrapSell, CardDeposit, TCGCardData, PriceHistoryPoint, Card, CreateWrapSellData, CreateMultipleWrapSellsData };
