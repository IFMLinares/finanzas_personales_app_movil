import apiClient from '@/api/apiClient';
import { ENDPOINTS } from '../constants/Endpoints';
import { Transaction, PaginatedResponse } from './financeService';

class TransactionService {
  async createTransaction(data: any): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS.BASE, data);
    return response.data;
  }

  async createTransfer(data: any): Promise<Transaction> {
    const payload = { ...data, type: 'TR' };
    const response = await apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS.BASE, payload);
    return response.data;
  }

  async getTransactions(params: any = {}): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.BASE, { params });
    return response.data;
  }

  async getTransactionById(id: string | number): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`${ENDPOINTS.TRANSACTIONS.BASE}${id}/`);
    return response.data;
  }

  async updateTransaction(id: string | number, data: any): Promise<Transaction> {
    const response = await apiClient.patch<Transaction>(`${ENDPOINTS.TRANSACTIONS.BASE}${id}/`, data);
    return response.data;
  }

  async deleteTransaction(id: string | number): Promise<boolean> {
    await apiClient.delete(`${ENDPOINTS.TRANSACTIONS.BASE}${id}/`);
    return true;
  }
}

export const transactionService = new TransactionService();
export default transactionService;
