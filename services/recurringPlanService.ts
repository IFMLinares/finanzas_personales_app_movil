import api from '@/api/apiClient';
import { ENDPOINTS } from '../constants/Endpoints';

export interface RecurringPlanSchedule {
    id?: number;
    day_of_week: number; // 0=Lunes, 6=Domingo
    amount: string | number;
}

export interface RecurringPlan {
    id?: number;
    title: string;
    account: number;
    category: number;
    is_active: boolean;
    created_at?: string;
    schedules: RecurringPlanSchedule[];
    account_detail?: any;
    category_detail?: any;
}

class RecurringPlanService {
    async getPlans(): Promise<RecurringPlan[]> {
        const response = await api.get(ENDPOINTS.TRANSACTIONS.PLANS);
        // Si la respuesta es paginada (DRF default), los datos están en results
        if (response.data && response.data.results) {
            return response.data.results;
        }
        return response.data || [];
    }

    async createPlan(data: RecurringPlan): Promise<RecurringPlan> {
        const response = await api.post(ENDPOINTS.TRANSACTIONS.PLANS, data);
        return response.data;
    }

    async updatePlan(id: number, data: Partial<RecurringPlan>): Promise<RecurringPlan> {
        const response = await api.patch(`${ENDPOINTS.TRANSACTIONS.PLANS}${id}/`, data);
        return response.data;
    }

    async deletePlan(id: number): Promise<void> {
        await api.delete(`${ENDPOINTS.TRANSACTIONS.PLANS}${id}/`);
    }

    /**
     * Calcula el estimado mensual basado en los días del mes actual.
     */
    calculateMonthlyEstimate(schedules: RecurringPlanSchedule[]): number {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let total = 0;
        
        // Creamos un mapa de montos por día de la semana para acceso rápido
        const amountMap: Record<number, number> = {};
        schedules.forEach(s => {
            amountMap[s.day_of_week] = Number(s.amount);
        });

        // Recorremos cada día del mes
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            // JS getDay(): 0=Domingo, 1=Lunes... 6=Sábado
            // Nuestro modelo: 0=Lunes... 6=Domingo
            const jsDay = date.getDay();
            const modelDay = jsDay === 0 ? 6 : jsDay - 1;
            
            if (amountMap[modelDay]) {
                total += amountMap[modelDay];
            }
        }
        
        return total;
    }
}

export const recurringPlanService = new RecurringPlanService();
