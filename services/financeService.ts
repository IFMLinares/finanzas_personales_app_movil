import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '../constants/Endpoints';

export interface Transaction {
  id: string | number;
  account: number | string;
  category: number | string | null;
  type: 'IN' | 'EX' | 'TR';
  amount: string | number;
  date: string;
  title?: string;
  notes?: string;
  destination_account?: number | string | null;
  destination_amount?: string | number | null;
  exchange_rate?: string | number | null;
  display_title?: string;
  display_type?: 'income' | 'expense' | 'transfer';
  display_icon?: string;
  category_detail?: { id: number | string; name: string; icon?: string };
  account_detail?: Account;
  destination_account_detail?: Account;
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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export interface Category {
  id: number | string;
  name: string;
  type: 'IN' | 'EX';
  icon?: string;
  parent?: number | null;
}

class FinanceService {
  async reorderAccounts(ids: (number | string)[]): Promise<boolean> {
    await apiClient.patch(`${ENDPOINTS.FINANCE.ACCOUNTS}reorder/`, { ids });
    return true;
  }

  async getAccount(id: number | string): Promise<Account> {
    const response = await apiClient.get<Account>(`${ENDPOINTS.FINANCE.ACCOUNTS}${id}/`);
    return response.data;
  }

  async updateAccount(id: number | string, data: any): Promise<Account> {
    const response = await apiClient.patch<Account>(`${ENDPOINTS.FINANCE.ACCOUNTS}${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  }
  async getDashboardSummary(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>(ENDPOINTS.FINANCE.DASHBOARD_SUMMARY);
    return response.data;
  }

  async getRecentTransactions(): Promise<Transaction[]> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.BASE, {
      params: { page_size: 10 }
    });
    const data = response.data?.results || [];
    return data.map(tx => ({
      ...tx,
      display_title: tx.title || tx.notes || (tx.type === 'IN' ? 'Ingreso' : tx.type === 'EX' ? 'Gasto' : 'Transferencia'),
      display_type: (tx.type === 'IN' ? 'income' : tx.type === 'EX' ? 'expense' : 'transfer') as 'income' | 'expense' | 'transfer',
      display_icon: tx.type === 'IN' ? 'cash-outline' : tx.type === 'EX' ? 'cart-outline' : 'swap-horizontal-outline',
    }));
  }

  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get<Account[]>(ENDPOINTS.FINANCE.ACCOUNTS);
    const data = Array.isArray(response.data) ? response.data : [];
    // Ordenar por display_order. Si no tiene, se manda al final (999).
    return data.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  }

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(ENDPOINTS.FINANCE.CATEGORIES);
    return Array.isArray(response.data) ? response.data : [];
  }

  async getCurrencies(): Promise<Currency[]> {
    const response = await apiClient.get<Currency[]>(ENDPOINTS.FINANCE.CURRENCIES);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Helper para organizar categorías jerárquicamente para el SelectModal.
   */
  getHierarchicalCategories(categories: Category[], type: 'IN' | 'EX'): any[] {
    const filtered = categories.filter(c => c.type === type);
    const parents = filtered.filter(c => !c.parent);
    const children = filtered.filter(c => !!c.parent);

    const result: any[] = [];

    parents.forEach(parent => {
      const parentChildren = children.filter(c => c.parent === parent.id);
      result.push({
        id: parent.id,
        label: parent.name,
        icon: parent.icon || 'folder-outline',
        hasChildren: parentChildren.length > 0,
        parentId: null
      });

      parentChildren.forEach(child => {
        result.push({
          id: child.id,
          label: child.name,
          icon: child.icon || 'bookmark-outline',
          parentId: parent.id,
          hasChildren: false
        });
      });
    });

    // Añadir huérfanos (hijos sin padre en la lista filtrada, por si acaso)
    children.forEach(child => {
      if (!result.find(r => r.id === child.id)) {
        result.push({
          id: child.id,
          label: child.name,
          icon: child.icon || 'bookmark-outline',
          parentId: null,
          hasChildren: false
        });
      }
    });

    return result;
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
   * Actualiza una categoría existente.
   */
  async updateCategory(id: string | number, data: any): Promise<Category | null> {
    try {
      const response = await apiClient.patch<Category>(`${ENDPOINTS.FINANCE.CATEGORIES}${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Elimina una categoría.
   */
  async deleteCategory(id: string | number): Promise<boolean> {
    try {
      await apiClient.delete(`${ENDPOINTS.FINANCE.CATEGORIES}${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
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
