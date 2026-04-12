export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  icon: string;
}

export interface BalanceSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

class FinanceService {
  /**
   * Obtiene el resumen del balance del usuario.
   * En una versión real, esto conectaría con una API o base de datos.
   */
  async getBalanceSummary(): Promise<BalanceSummary> {
    // Simulamos un retraso de red
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalBalance: 12450.85,
          monthlyIncome: 4500.00,
          monthlyExpenses: 2150.20,
        });
      }, 500);
    });
  }

  /**
   * Obtiene la lista de transacciones recientes.
   */
  async getRecentTransactions(): Promise<Transaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Suscripción Netflix',
            amount: 15.99,
            category: 'Entretenimiento',
            date: 'Hoy, 10:30 AM',
            type: 'expense',
            icon: 'tv-outline',
          },
          {
            id: '2',
            title: 'Depósito Nómina',
            amount: 2200.00,
            category: 'Salario',
            date: 'Ayer',
            type: 'income',
            icon: 'cash-outline',
          },
          {
            id: '3',
            title: 'Compra Supermercado',
            amount: 85.40,
            category: 'Alimentación',
            date: '10 Abr',
            type: 'expense',
            icon: 'cart-outline',
          },
          {
            id: '4',
            title: 'Transferencia Bizum',
            amount: 20.00,
            category: 'Varios',
            date: '09 Abr',
            type: 'expense',
            icon: 'send-outline',
          },
        ]);
      }, 800);
    });
  }
}

export const financeService = new FinanceService();
