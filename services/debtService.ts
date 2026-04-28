import apiClient from '@/api/apiClient';

export interface Debt {
    id: number;
    creditor: string;
    title: string;
    total_amount: number;
    balance_remaining: number;
    installments_total: number;
    installments_paid: number;
    next_due_date: string;
    is_paid: boolean;
}

export const debtService = {
    getDebts: async (): Promise<Debt[]> => {
        const response = await apiClient.get('/debts/');
        // Manejar respuesta paginada o directa
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        return [];
    },
    createDebt: async (data: any) => {
        const response = await apiClient.post('/debts/', data);
        return response.data;
    },
    deleteDebt: async (id: number) => {
        await apiClient.delete(`/debts/${id}/`);
    }
};
