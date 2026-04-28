import apiClient from '@/api/apiClient';

export interface BudgetStatus {
    budget_id: number;
    category_name: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    is_over_budget: boolean;
}

export const budgetService = {
    getBudgets: async () => {
        const response = await apiClient.get('/budgets/');
        return response.data;
    },
    getBudgetStatus: async (): Promise<BudgetStatus[]> => {
        const response = await apiClient.get('/budgets/status/');
        return response.data;
    },
    createBudget: async (data: any) => {
        const response = await apiClient.post('/budgets/', data);
        return response.data;
    },
    deleteBudget: async (id: number) => {
        await apiClient.delete(`/budgets/${id}/`);
    }
};
