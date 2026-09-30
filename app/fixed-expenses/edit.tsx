import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { SelectModal } from '@/components/ui/SelectModal';
import { WeeklyScheduleSelector } from '@/components/ui/WeeklyScheduleSelector';
import { DatePickerBottomSheet } from '@/components/ui/DatePickerBottomSheet';
import { recurringPlanService } from '@/services/recurringPlanService';
import { recurringExpenseService } from '@/services/recurringExpenseService';
import { normalizeMonthly, RecurringFrequency } from '@/utils/recurringMath';
import { financeService } from '@/services/financeService';
import { useToast } from '@/contexts/ToastContext';
import { BackgroundAura } from '@/components/ui/BackgroundAura';
import { formatCurrencyWithSymbol, getCurrencySymbol } from '@/utils/formatters';

const INITIAL_SCHEDULE = [
    { day_of_week: 0, amount: '0', active: false },
    { day_of_week: 1, amount: '0', active: false },
    { day_of_week: 2, amount: '0', active: false },
    { day_of_week: 3, amount: '0', active: false },
    { day_of_week: 4, amount: '0', active: false },
    { day_of_week: 5, amount: '0', active: false },
    { day_of_week: 6, amount: '0', active: false },
];

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
];

function toISODate(d: Date): string {
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseISODate(iso: string): Date {
    if (!iso) return new Date();
    const [year, month, day] = iso.split('-').map(Number);
    if (!year || !month || !day) return new Date();
    return new Date(year, month - 1, day);
}

export default function EditFixedExpenseScreen() {
    const router = useRouter();
    const { id, type } = useLocalSearchParams();
    const isExpense = type === 'recurring-expense';
    const isEditing = !!id;
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // Shared state
    const [name, setName] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [isActive, setIsActive] = useState(true);

    // Plan-specific state
    const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

    // Expense-specific state
    const [amount, setAmount] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
    const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
    const [nextDate, setNextDate] = useState<Date>(new Date());
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderDaysBefore, setReminderDaysBefore] = useState(3);

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Queries
    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => financeService.getAccounts(),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => financeService.getCategories(),
    });

    const { data: currencies = [] } = useQuery({
        queryKey: ['currencies'],
        queryFn: () => financeService.getCurrencies(),
        enabled: isExpense,
    });

    const { data: plan, isLoading: loadingPlan } = useQuery({
        queryKey: ['recurring-plan', id],
        queryFn: () => recurringPlanService.getPlans().then(plans => plans.find(p => p.id === Number(id))),
        enabled: isEditing && !isExpense
    });

    const { data: expense, isLoading: loadingExpense } = useQuery({
        queryKey: ['recurring-expense', id],
        queryFn: () => recurringExpenseService.getExpenses().then(list => list.find(e => e.id === Number(id))),
        enabled: isEditing && isExpense
    });

    useEffect(() => {
        if (isEditing && !isExpense && plan) {
            setName(plan.title);
            setIsActive(plan.is_active);
            setSelectedAccount(plan.account_detail);
            if (plan.category_detail) {
                setSelectedCategory({
                    id: plan.category_detail.id,
                    label: plan.category_detail.name,
                    icon: plan.category_detail.icon || 'bookmark-outline'
                });
            }

            const newSchedule = INITIAL_SCHEDULE.map(item => {
                const dayPlan = plan.schedules.find(s => s.day_of_week === item.day_of_week);
                if (dayPlan) {
                    return { ...item, amount: dayPlan.amount.toString(), active: Number(dayPlan.amount) > 0 };
                }
                return item;
            });
            setSchedule(newSchedule);
        }
    }, [isEditing, isExpense, plan]);

    useEffect(() => {
        if (isEditing && isExpense && expense) {
            setName(expense.name);
            setAmount(String(expense.amount ?? ''));
            setFrequency(expense.frequency);
            setNextDate(parseISODate(expense.next_execution_date));
            setIsActive(expense.is_active);
            setSelectedAccount(expense.account_detail);
            setReminderEnabled(expense.reminder_enabled ?? false);
            setReminderDaysBefore(expense.reminder_days_before ?? 3);
            if (expense.currency_detail) {
                setSelectedCurrency(expense.currency_detail);
            }
            if (expense.category_detail) {
                setSelectedCategory({
                    id: expense.category_detail.id,
                    label: expense.category_detail.name,
                    icon: expense.category_detail.icon || 'bookmark-outline'
                });
            }
        }
    }, [isEditing, isExpense, expense]);

    const mutation = useMutation({
        mutationFn: async (data: any): Promise<any> => {
            if (isExpense) {
                return isEditing
                    ? recurringExpenseService.updateExpense(Number(id), data)
                    : recurringExpenseService.createExpense(data);
            }
            return isEditing
                ? recurringPlanService.updatePlan(Number(id), data)
                : recurringPlanService.createPlan(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [isExpense ? 'recurring-expenses' : 'recurring-plans'] });
            showToast({ message: isEditing ? 'Actualizado' : 'Creado con éxito', type: 'success' });
            router.back();
        },
        onError: (error: any) => {
            showToast({ message: 'Error al guardar', type: 'error' });
        }
    });

    const handleSave = () => {
        if (!name.trim()) {
            showToast({ message: 'El nombre es obligatorio', type: 'info' });
            return;
        }
        if (!selectedAccount) {
            showToast({ message: 'Selecciona una cuenta de origen', type: 'info' });
            return;
        }

        if (isExpense) {
            const numericAmount = Number(amount);
            if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
                showToast({ message: 'Introduce un monto mayor a 0', type: 'info' });
                return;
            }
            if (!selectedCategory?.id) {
                showToast({ message: 'Selecciona una categoría', type: 'info' });
                return;
            }
            if (!selectedCurrency?.id) {
                showToast({ message: 'Selecciona una moneda', type: 'info' });
                return;
            }

            mutation.mutate({
                name: name.trim(),
                amount: amount.trim(),
                currency: selectedCurrency.id,
                category: selectedCategory.id,
                account: selectedAccount.id,
                frequency,
                next_execution_date: toISODate(nextDate),
                is_active: isActive,
                reminder_enabled: reminderEnabled,
                reminder_days_before: reminderDaysBefore,
            });
            return;
        }

        const schedulesToSave = schedule
            .filter(s => s.active && Number(s.amount) > 0)
            .map(s => ({ day_of_week: s.day_of_week, amount: Number(s.amount) }));

        if (schedulesToSave.length === 0) {
            showToast({ message: 'Configura al menos un día de gasto', type: 'info' });
            return;
        }

        mutation.mutate({
            title: name.trim(),
            account: selectedAccount.id,
            category: selectedCategory?.id,
            is_active: isActive,
            schedules: schedulesToSave
        });
    };

    const monthlyEstimate = isExpense
        ? normalizeMonthly(amount, frequency)
        : recurringPlanService.calculateMonthlyEstimate(
            schedule.filter(s => s.active).map(s => ({ day_of_week: s.day_of_week, amount: s.amount }))
        );

    const isLoading = isEditing && (isExpense ? loadingExpense : loadingPlan);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-950 items-center justify-center">
                <ActivityIndicator color="#8b5cf6" />
            </View>
        );
    }

    const screenTitle = isExpense
        ? (isEditing ? 'Editar Suscripción' : 'Nueva Suscripción')
        : (isEditing ? 'Editar Plan' : 'Nuevo Plan Fijo');

    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <BackgroundAura color="#8b5cf6" size={400} opacity={0.1} bottom={-100} left={-100} />

            <View className="px-6 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Typography variant="h2" weight="bold" className="text-white">
                    {screenTitle}
                </Typography>
            </View>

            <ScrollView className="flex-1 px-6">
                <View className="space-y-6 pb-20">
                    {/* Nombre */}
                    <View className="space-y-2">
                        <Typography variant="caption" className="text-ink-tertiary">
                            {isExpense ? 'Nombre de la suscripción (ej. Netflix)' : 'Nombre del plan (ej. Pasaje Trabajo)'}
                        </Typography>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Introduce un nombre..."
                            placeholderTextColor="#475569"
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-lg"
                        />
                    </View>

                    {isExpense && (
                        <>
                            {/* Monto */}
                            <View className="space-y-2">
                                <Typography variant="caption" className="text-ink-tertiary">Monto</Typography>
                                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <Typography className="text-white text-lg mr-2">
                                        {getCurrencySymbol(selectedCurrency?.symbol || selectedCurrency?.code)}
                                    </Typography>
                                    <TextInput
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        placeholderTextColor="#475569"
                                        className="flex-1 text-white text-lg"
                                    />
                                </View>
                            </View>

                            {/* Cuenta y Categoría */}
                            <View className="flex-row space-x-4">
                                <TouchableOpacity onPress={() => setShowAccountModal(true)} className="flex-1">
                                    <Typography variant="caption" className="text-ink-tertiary mb-2">Cuenta</Typography>
                                    <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                        <Typography className={selectedAccount ? 'text-white' : 'text-gray-500'}>
                                            {selectedAccount ? selectedAccount.name : 'Seleccionar'}
                                        </Typography>
                                        <Ionicons name="chevron-down" size={16} color="#64748b" />
                                    </GlassCard>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setShowCategoryModal(true)} className="flex-1">
                                    <Typography variant="caption" className="text-ink-tertiary mb-2">Categoría</Typography>
                                    <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                        <Typography className={selectedCategory ? 'text-white' : 'text-gray-500'}>
                                            {selectedCategory ? selectedCategory.label : 'Seleccionar'}
                                        </Typography>
                                        <Ionicons name="chevron-down" size={16} color="#64748b" />
                                    </GlassCard>
                                </TouchableOpacity>
                            </View>

                            {/* Moneda */}
                            <TouchableOpacity onPress={() => setShowCurrencyModal(true)}>
                                <Typography variant="caption" className="text-ink-tertiary mb-2">Moneda</Typography>
                                <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                    <Typography className={selectedCurrency ? 'text-white' : 'text-gray-500'}>
                                        {selectedCurrency ? `${selectedCurrency.code} (${selectedCurrency.symbol})` : 'Seleccionar'}
                                    </Typography>
                                    <Ionicons name="chevron-down" size={16} color="#64748b" />
                                </GlassCard>
                            </TouchableOpacity>

                            {/* Frecuencia */}
                            <View className="space-y-2">
                                <Typography variant="caption" className="text-ink-tertiary mb-2">Frecuencia</Typography>
                                <View className="flex-row flex-wrap gap-2">
                                    {FREQUENCIES.map(f => {
                                        const isSelected = frequency === f.value;
                                        return (
                                            <TouchableOpacity
                                                key={f.value}
                                                onPress={() => setFrequency(f.value)}
                                                className={`px-4 py-2.5 rounded-full border ${isSelected ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/5 border-white/10'}`}
                                            >
                                                <Typography weight={isSelected ? 'bold' : 'regular'} className={isSelected ? 'text-white' : 'text-ink-tertiary'}>
                                                    {f.label}
                                                </Typography>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Fecha de próximo pago */}
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <Typography variant="caption" className="text-ink-tertiary mb-2">Próximo pago</Typography>
                                <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center mr-4">
                                            <Ionicons name="calendar-outline" size={20} color="#8b5cf6" />
                                        </View>
                                        <Typography weight="bold" className="text-white">
                                            {toISODate(nextDate)}
                                        </Typography>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#475569" />
                                </GlassCard>
                            </TouchableOpacity>

                            {/* Recordatorios */}
                            <View className="space-y-2">
                                <View className="flex-row items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <View className="flex-1 pr-3">
                                        <Typography weight="bold" className="text-white">Recordatorios</Typography>
                                        <Typography variant="caption" className="text-ink-tertiary">Avisarme antes del vencimiento</Typography>
                                    </View>
                                    <Switch
                                        value={reminderEnabled}
                                        onValueChange={setReminderEnabled}
                                        trackColor={{ false: '#1e293b', true: '#465fff33' }}
                                        thumbColor={reminderEnabled ? '#8b5cf6' : '#475569'}
                                        ios_backgroundColor="#1e293b"
                                    />
                                </View>

                                {reminderEnabled && (
                                    <View className="flex-row items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <Typography className="text-white">Días antes del vencimiento</Typography>
                                        <View className="flex-row items-center">
                                            <TouchableOpacity
                                                onPress={() => setReminderDaysBefore(d => Math.max(1, d - 1))}
                                                className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center"
                                            >
                                                <Ionicons name="remove" size={18} color="white" />
                                            </TouchableOpacity>
                                            <Typography weight="bold" className="text-white text-lg w-10 text-center">
                                                {reminderDaysBefore}
                                            </Typography>
                                            <TouchableOpacity
                                                onPress={() => setReminderDaysBefore(d => Math.min(14, d + 1))}
                                                className="w-10 h-10 rounded-xl bg-white/10 items-center justify-center"
                                            >
                                                <Ionicons name="add" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Cuenta y Categoría (Plan mode) */}
                    {!isExpense && (
                        <View className="flex-row space-x-4">
                            <TouchableOpacity onPress={() => setShowAccountModal(true)} className="flex-1">
                                <Typography variant="caption" className="text-ink-tertiary mb-2">Cuenta</Typography>
                                <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                    <Typography className={selectedAccount ? 'text-white' : 'text-gray-500'}>
                                        {selectedAccount ? selectedAccount.name : 'Seleccionar'}
                                    </Typography>
                                    <Ionicons name="chevron-down" size={16} color="#64748b" />
                                </GlassCard>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowCategoryModal(true)} className="flex-1">
                                <Typography variant="caption" className="text-ink-tertiary mb-2">Categoría</Typography>
                                <GlassCard className="p-4 border border-white/10 flex-row items-center justify-between">
                                    <Typography className={selectedCategory ? 'text-white' : 'text-gray-500'}>
                                        {selectedCategory ? selectedCategory.label : 'Seleccionar'}
                                    </Typography>
                                    <Ionicons name="chevron-down" size={16} color="#64748b" />
                                </GlassCard>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Selector Semanal (solo plan) */}
                    {!isExpense && (
                        <View className="space-y-4">
                            <View className="flex-row justify-between items-center">
                                <Typography weight="bold" className="text-white text-lg">Horario Semanal</Typography>
                                <View className="bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                    <Typography variant="caption" weight="bold" className="text-purple-400">
                                        ~ {formatCurrencyWithSymbol(monthlyEstimate, selectedAccount?.currency_detail?.symbol)} / mes
                                    </Typography>
                                </View>
                            </View>

                            <WeeklyScheduleSelector
                                value={schedule}
                                onChange={setSchedule}
                                accentColor={selectedAccount?.color || '#8b5cf6'}
                                currencySymbol={getCurrencySymbol(selectedAccount?.currency_detail?.symbol || selectedAccount?.currency_detail?.code)}
                            />
                        </View>
                    )}

                    {/* Equivalente mensual (solo suscripción) */}
                    {isExpense && (
                        <View className="bg-purple-500/10 px-4 py-3 rounded-2xl border border-purple-500/20 flex-row justify-between items-center">
                            <Typography variant="caption" className="text-purple-400">Equivalente mensual</Typography>
                            <Typography weight="bold" className="text-white">
                                {formatCurrencyWithSymbol(monthlyEstimate, selectedCurrency?.symbol || selectedCurrency?.code)} / mes
                            </Typography>
                        </View>
                    )}

                    {/* Botón de Guardar */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={mutation.isPending}
                        className={`mt-6 p-4 rounded-2xl items-center shadow-lg ${mutation.isPending ? 'bg-purple-500/50' : 'bg-purple-600'}`}
                    >
                        {mutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Typography weight="bold" className="text-white text-lg">
                                {isEditing ? 'Guardar Cambios' : (isExpense ? 'Crear Suscripción' : 'Activar Plan')}
                            </Typography>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SelectModal
                isVisible={showAccountModal}
                title="Seleccionar Cuenta"
                options={accounts.map((a: any) => ({ id: a.id, label: a.name, color: a.color }))}
                onSelect={(opt) => {
                    setSelectedAccount(accounts.find((a: any) => a.id === opt.id));
                    setShowAccountModal(false);
                }}
                onClose={() => setShowAccountModal(false)}
            />

            <SelectModal
                isVisible={showCategoryModal}
                title="Seleccionar Categoría"
                options={categories
                    .filter((c: any) => c.type === 'EX')
                    .map((c: any) => ({ id: c.id, label: c.name, icon: c.icon }))
                }
                onSelect={(opt) => {
                    setSelectedCategory(opt);
                    setShowCategoryModal(false);
                }}
                onClose={() => setShowCategoryModal(false)}
            />

            <SelectModal
                isVisible={showCurrencyModal}
                title="Seleccionar Moneda"
                options={currencies.map((c: any) => ({ id: c.id, label: c.code, sublabel: c.name }))}
                onSelect={(opt) => {
                    setSelectedCurrency(currencies.find((c: any) => c.id === opt.id));
                    setShowCurrencyModal(false);
                }}
                onClose={() => setShowCurrencyModal(false)}
            />

            <DatePickerBottomSheet
                isVisible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                value={nextDate}
                onSelectDate={setNextDate}
            />
        </SafeAreaView>
    );
}
