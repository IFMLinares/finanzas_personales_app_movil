import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '../constants/Endpoints';

export interface Transaction {
  id: string | number;
  account: number | string;
  category: number | string | null;
  type: 'IN' | 'EX' | 'TR';
  amount: string | number;
  date: string;
  notes?: string;
  destination_account?: number | string | null;
  destination_amount?: string | number | null;
  exchange_rate?: string | number | null;
  display_title?: string;
  display_type?: 'income' | 'expense' | 'transfer';
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

export interface Account {
  id: number | string;
  name: string;
  currency: number;
  currency_detail: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
  balance: string | number;
  display_order?: number;
  icon_url?: string;
  icon_image?: string;
  display_icon?: string;
}

export interface Category {
  id: number | string;
  name: string;
  type: 'IN' | 'EX';
  parent?: number | null;
}

class FinanceService {
  /**
   * Reordena las cuentas del usuario.
   */
  async reorderAccounts(ids: (number | string)[]): Promise<boolean> {
    try {
      await apiClient.patch(`${ENDPOINTS.FINANCE.ACCOUNTS}reorder/`, { ids });
      return true;
    } catch (error) {
      console.error('Error reordering accounts:', error);
      return false;
    }
  }

  /**
   * Obtiene los detalles de una cuenta.
   */
  async getAccount(id: number | string): Promise<Account | null> {
    try {
      const response = await apiClient.get<Account>(`${ENDPOINTS.FINANCE.ACCOUNTS}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching account detail:', error);
      return null;
    }
  }

  /**
   * Actualiza una cuenta.
   */
  async updateAccount(id: number | string, data: any): Promise<Account | null> {
    try {
      const response = await apiClient.patch<Account>(`${ENDPOINTS.FINANCE.ACCOUNTS}${id}/`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }
  /**
   * Obtiene el resumen multimoneda del Dashboard.
   * Nueva ruta modularizada: /finance/dashboard/summary/
   */
  async getDashboardSummary(): Promise<DashboardResponse | null> {
    try {
      const response = await apiClient.get<DashboardResponse>(ENDPOINTS.FINANCE.DASHBOARD_SUMMARY);
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
  /**
   * Obtiene la lista de transacciones reales del usuario.
   * Ruta modularizada: /transactions/
   */
  async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<Transaction[]>(ENDPOINTS.TRANSACTIONS.BASE);
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map(tx => ({
        ...tx,
        display_title: tx.notes || (tx.type === 'IN' ? 'Ingreso' : tx.type === 'EX' ? 'Gasto' : 'Transferencia'),
        display_type: (tx.type === 'IN' ? 'income' : tx.type === 'EX' ? 'expense' : 'transfer') as 'income' | 'expense' | 'transfer',
        display_icon: tx.type === 'IN' ? 'cash-outline' : tx.type === 'EX' ? 'cart-outline' : 'swap-horizontal-outline',
      })).slice(0, 10);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Obtiene la lista de cuentas del usuario.
   */
  async getAccounts(): Promise<Account[]> {
    try {
      const response = await apiClient.get<Account[]>(ENDPOINTS.FINANCE.ACCOUNTS);
      const data = Array.isArray(response.data) ? response.data : [];
      // Ordenar por display_order. Si no tiene, se manda al final (999).
      return data.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  }

  /**
   * Obtiene la lista de categorías del usuario.
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(ENDPOINTS.FINANCE.CATEGORIES);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Crea una nueva categoría.
   */
  async createCategory(data: any): Promise<Category | null> {
    try {
      const response = await apiClient.post<Category>(ENDPOINTS.FINANCE.CATEGORIES, data);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva cuenta.
   */
  async createAccount(data: any): Promise<Account | null> {
    try {
      const response = await apiClient.post<Account>(ENDPOINTS.FINANCE.ACCOUNTS, data);
      return response.data;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }
}

export const financeService = new FinanceService();
