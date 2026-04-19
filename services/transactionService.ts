import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '../constants/Endpoints';
import { Transaction, PaginatedResponse } from './financeService';

class TransactionService {
  /**
   * Registra un nuevo movimiento (Ingreso o Gasto).
   * @param data Payload con account, category, type, amount, date, notes
   */
  async createTransaction(data: any): Promise<Transaction | null> {
    try {
      const response = await apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS.BASE, data);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Registra una transferencia entre cuentas.
   * @param data Incluye destination_account, destination_amount, exchange_rate
   */
  async createTransfer(data: any): Promise<Transaction | null> {
    try {
      // En el backend, las transferencias usan el mismo endpoint POST /transactions/
      // El serializador de Django maneja la lógica según el type='TR'
      const payload = {
        ...data,
        type: 'TR'
      };
      const response = await apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS.BASE, payload);
      return response.data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de transacciones con filtros y paginación opcionales.
   */
  async getTransactions(params: { 
    type?: string, 
    account?: number | string, 
    category?: number | string,
    search?: string,
    date_from?: string,
    date_to?: string,
    page?: number,
    page_size?: number
  } = {}): Promise<PaginatedResponse<Transaction>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.BASE, { params });
      return response.data || { count: 0, next: null, previous: null, results: [] };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { count: 0, next: null, previous: null, results: [] };
    }
  }

  /**
   * Obtiene una transacción por su ID.
   */
  async getTransactionById(id: string | number): Promise<Transaction | null> {
    try {
      const response = await apiClient.get<Transaction>(`${ENDPOINTS.TRANSACTIONS.BASE}${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      return null;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;
