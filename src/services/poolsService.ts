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
}

export const poolsService = new PoolsService();
export type { WrapPool, WrapSell, CardDeposit, TCGCardData, PriceHistoryPoint };
