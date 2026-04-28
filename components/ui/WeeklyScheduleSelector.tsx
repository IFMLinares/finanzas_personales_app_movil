import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Typography } from './Typography';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';

interface DayConfig {
    day_of_week: number;
    amount: string;
    active: boolean;
}

interface WeeklyScheduleSelectorProps {
    value: DayConfig[];
    onChange: (newValue: DayConfig[]) => void;
    accentColor?: string;
    currencySymbol?: string;
}

const DAYS = [
    { id: 0, label: 'L', full: 'Lunes' },
    { id: 1, label: 'M', full: 'Martes' },
    { id: 2, label: 'M', full: 'Miércoles' },
    { id: 3, label: 'J', full: 'Jueves' },
    { id: 4, label: 'V', full: 'Viernes' },
    { id: 5, label: 'S', full: 'Sábado' },
    { id: 6, label: 'D', full: 'Domingo' },
];

export const WeeklyScheduleSelector: React.FC<WeeklyScheduleSelectorProps> = ({ 
    value, 
    onChange,
    accentColor = '#8b5cf6',
    currencySymbol = '$'
}) => {
    
    const toggleDay = (dayId: number) => {
        const newValue = value.map(day => {
            if (day.day_of_week === dayId) {
                return { ...day, active: !day.active, amount: !day.active ? '0' : day.amount };
            }
            return day;
        });
        onChange(newValue);
    };

    const updateAmount = (dayId: number, amount: string) => {
        const newValue = value.map(day => {
            if (day.day_of_week === dayId) {
                return { ...day, amount: amount.replace(/[^0-9.]/g, '') };
            }
            return day;
        });
        onChange(newValue);
    };

    return (
        <View className="space-y-4">
            <View className="flex-row justify-between">
                {DAYS.map((day) => {
                    const config = value.find(v => v.day_of_week === day.id);
                    const isActive = config?.active;

                    return (
                        <TouchableOpacity
                            key={day.id}
                            onPress={() => toggleDay(day.id)}
                            activeOpacity={0.7}
                            className={`w-10 h-10 rounded-full items-center justify-center border ${
                                isActive 
                                ? 'bg-purple-500/20 border-purple-500/50' 
                                : 'bg-white/5 border-white/10'
                            }`}
                            style={isActive ? { backgroundColor: `${accentColor}33`, borderColor: `${accentColor}88` } : {}}
                        >
                            <Typography 
                                weight={isActive ? 'bold' : 'regular'}
                                className={isActive ? 'text-white' : 'text-ink-tertiary'}
                                style={isActive ? { color: 'white' } : {}}
                            >
                                {day.label}
                            </Typography>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View className="space-y-3">
                {value.filter(d => d.active).map((dayConfig) => {
                    const dayInfo = DAYS.find(d => d.id === dayConfig.day_of_week);
                    
                    return (
                        <GlassCard key={dayConfig.day_of_week} className="p-4 flex-row items-center justify-between border border-white/5">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center mr-3">
                                    <Typography variant="caption" weight="bold" className="text-white">
                                        {dayInfo?.label}
                                    </Typography>
                                </View>
                                <Typography className="text-white">{dayInfo?.full}</Typography>
                            </View>
                            
                            <View className="flex-row items-center bg-black/20 px-3 py-1 rounded-xl border border-white/5">
                                <Typography className="text-ink-tertiary mr-1">{currencySymbol}</Typography>
                                <TextInput
                                    value={dayConfig.amount}
                                    onChangeText={(text) => updateAmount(dayConfig.day_of_week, text)}
                                    keyboardType="decimal-pad"
                                    className="text-white font-bold min-w-[60px] text-right"
                                    placeholder="0.00"
                                    placeholderTextColor="#475569"
                                />
                            </View>
                        </GlassCard>
                    );
                })}

                {value.every(d => !d.active) && (
                    <View className="py-8 items-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Ionicons name="calendar-outline" size={32} color="#475569" />
                        <Typography className="text-ink-tertiary mt-2">Selecciona los días de gasto</Typography>
                    </View>
                )}
            </View>
        </View>
    );
};
