import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '../constants/Endpoints';
import { Transaction } from './financeService';

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
}

export const transactionService = new TransactionService();
export default transactionService;
