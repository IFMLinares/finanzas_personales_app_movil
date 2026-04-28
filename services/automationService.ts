import apiClient from '@/api/apiClient';

export interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
}

export interface ExpenseTemplate {
    id: number;
    name: string;
    amount: number;
    currency: number;
    currency_detail?: Currency;
    category: number;
    preferred_account: number;
}

export const automationService = {
    getTemplates: async (): Promise<ExpenseTemplate[]> => {
        const response = await apiClient.get('/automation/templates/');
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        return [];
    },
    createTemplate: async (data: any) => {
        const response = await apiClient.post('/automation/templates/', data);
        return response.data;
    },
    applyTemplate: async (templateId: number) => {
        return templateId;
    },
    updateTemplate: async (id: number, data: Partial<ExpenseTemplate>) => {
        const response = await apiClient.patch(`/automation/templates/${id}/`, data);
        return response.data;
    },
    deleteTemplate: async (id: number) => {
        await apiClient.delete(`/automation/templates/${id}/`);
    }
};
