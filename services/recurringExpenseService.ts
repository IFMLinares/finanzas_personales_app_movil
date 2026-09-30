import api from '@/api/apiClient';
import { ENDPOINTS } from '../constants/Endpoints';
import { normalizeMonthly, RecurringFrequency } from '../utils/recurringMath';

export { normalizeMonthly };
export type { RecurringFrequency };

export interface RecurringExpenseCategoryDetail {
    id: number;
    name: string;
    icon?: string;
    type: string;
}

export interface RecurringExpense {
    id?: number;
    name: string;
    amount: string | number;
    currency: number;
    category: number;
    account: number;
    frequency: RecurringFrequency;
    next_execution_date: string;
    last_execution_date?: string | null;
    is_active: boolean;
    created_at?: string;
    category_detail?: RecurringExpenseCategoryDetail;
    account_detail?: any;
    currency_detail?: { id: number; code: string; symbol: string };
    reminder_enabled?: boolean;
    reminder_days_before?: number;
    last_reminder_date?: string | null;
}

class RecurringExpenseService {
    async getExpenses(): Promise<RecurringExpense[]> {
        const response = await api.get(ENDPOINTS.AUTOMATION.RECURRING_EXPENSES);
        // DRF paginated responses carry the data under `results`.
        if (response.data && response.data.results) {
            return response.data.results;
        }
        return response.data || [];
    }

    async createExpense(data: RecurringExpense): Promise<RecurringExpense> {
        const response = await api.post(ENDPOINTS.AUTOMATION.RECURRING_EXPENSES, data);
        return response.data;
    }

    async updateExpense(id: number, data: Partial<RecurringExpense>): Promise<RecurringExpense> {
        const response = await api.patch(`${ENDPOINTS.AUTOMATION.RECURRING_EXPENSES}${id}/`, data);
        return response.data;
    }

    async deleteExpense(id: number): Promise<void> {
        await api.delete(`${ENDPOINTS.AUTOMATION.RECURRING_EXPENSES}${id}/`);
    }
}

export const recurringExpenseService = new RecurringExpenseService();
