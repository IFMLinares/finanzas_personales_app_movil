export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Normalizes a recurring amount to its monthly equivalent so fixed expenses
 * with different frequencies can be summed into a single monthly total.
 *
 * - monthly: amount * 1
 * - yearly:  amount / 12
 * - weekly:  amount * 52 / 12
 * - daily:   amount * 30
 */
export function normalizeMonthly(amount: number | string, frequency: RecurringFrequency): number {
    const value = Number(amount);
    if (!Number.isFinite(value)) return 0;

    switch (frequency) {
        case 'daily':
            return value * 30;
        case 'weekly':
            return (value * 52) / 12;
        case 'yearly':
            return value / 12;
        case 'monthly':
        default:
            return value;
    }
}
