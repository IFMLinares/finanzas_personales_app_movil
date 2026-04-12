import apiClient from '@/api/apiClient';

export interface Transaction {
  id: string | number;
  account: number | string;
  category: number | string | null;
  type: 'IN' | 'EX' | 'TR';
  amount: string | number;
  date: string;
  notes?: string;
  display_title?: string;
  display_type?: 'income' | 'expense';
  display_icon?: string;
}

export interface DashboardResponse {
  balances: {
    USD: number;
    EUR: number;
    USDT: number;
    VES: number;
  };
  rates: {
    USD: number;
    EUR: number;
    USDT: number;
  };
  currency_symbols: {
    [key: string]: string;
  };
  monthly_stats: {
    income_usd: number;
    expenses_usd: number;
  };
}

class FinanceService {
  /**
   * Obtiene el resumen multimoneda del Dashboard.
   * Nueva ruta modularizada: /finance/dashboard/summary/
   */
  async getDashboardSummary(): Promise<DashboardResponse | null> {
    try {
      const response = await apiClient.get<DashboardResponse>('/finance/dashboard/summary/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return null;
    }
  }

  /**
   * Obtiene la lista de transacciones reales del usuario.
   * Ruta modularizada: /transactions/
   */
  async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<Transaction[]>('/transactions/');
      
      const data = Array.isArray(response.data) ? response.data : [];
      
      return data.map(tx => ({
        ...tx,
        display_title: tx.notes || (tx.type === 'IN' ? 'Ingreso' : tx.type === 'EX' ? 'Gasto' : 'Transferencia'),
        display_type: (tx.type === 'IN' ? 'income' : 'expense') as 'income' | 'expense',
        display_icon: tx.type === 'IN' ? 'cash-outline' : tx.type === 'EX' ? 'cart-outline' : 'swap-horizontal-outline',
      })).slice(0, 10);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
}

export const financeService = new FinanceService();
