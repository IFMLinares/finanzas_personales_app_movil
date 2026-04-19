import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';

interface DateFilterBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onSelectRange: (start: string, end: string) => void;
}

export function DateFilterBottomSheet({ 
  isVisible, 
  onClose, 
  startDate: initialStart,
  endDate: initialEnd,
  onSelectRange 
}: DateFilterBottomSheetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tempStart, setTempStart] = useState(initialStart);
  const [tempEnd, setTempEnd] = useState(initialEnd);
  
  useEffect(() => {
    if (isVisible) {
      setTempStart(initialStart);
      setTempEnd(initialEnd);
    }
  }, [isVisible]);

  const handleApply = () => {
    onSelectRange(tempStart, tempEnd);
    onClose();
  };

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleDatePress = (date: Date) => {
    const dateStr = formatDate(date);
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd('');
    } else {
      if (dateStr < tempStart) {
        setTempStart(dateStr);
        setTempEnd('');
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const isSelected = (date: Date) => {
    const d = formatDate(date);
    return d === tempStart || d === tempEnd;
  };

  const isInRange = (date: Date) => {
    const d = formatDate(date);
    return tempStart && tempEnd && d > tempStart && d < tempEnd;
  };

  const days = generateDays();
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <BaseBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title="Filtrar Fecha"
    >
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* Quick Presets */}
        <View className="flex-row gap-2 mb-8">
          {[
            { label: 'Hoy', get: () => ({ start: formatDate(new Date()), end: formatDate(new Date()) }) },
            { 
              label: 'Mes Actual', 
              get: () => {
                const now = new Date();
                return { 
                  start: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
                  end: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
                };
              }
            },
            {
              label: 'Últ. 7 días',
              get: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 7);
                return { start: formatDate(start), end: formatDate(end) };
              }
            }
          ].map((preset, idx) => (
            <TouchableOpacity 
              key={idx}
              onPress={() => {
                const { start, end } = preset.get();
                setTempStart(start);
                setTempEnd(end);
              }}
              className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl"
            >
              <Typography variant="caption" weight="semibold" className="text-gray-400">{preset.label}</Typography>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar Header */}
        <View className="flex-row justify-between items-center mb-6 px-2">
          <Typography weight="bold" className="text-white text-lg capitalize">{monthName}</Typography>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap mb-8">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
            <View key={idx} className="w-[14.28%] items-center mb-4">
              <Typography variant="caption" className="text-gray-600 font-bold">{day}</Typography>
            </View>
          ))}
          
          {days.map((day, idx) => {
            if (!day) return <View key={idx} className="w-[14.28%] h-12" />;
            const active = isSelected(day);
            const range = isInRange(day);

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleDatePress(day)}
                className="w-[14.28%] h-12 items-center justify-center relative"
              >
                {range && (
                  <View className="absolute inset-y-2 inset-x-0 bg-brand-500/10" />
                )}
                {active && (
                  <View className="absolute w-10 h-10 rounded-xl bg-brand-500" />
                )}
                <Typography 
                  weight={active ? 'bold' : 'semibold'}
                  className={active ? 'text-white' : range ? 'text-brand-400' : 'text-gray-400'}
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {day.getDate()}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selection Display */}
        <View className="flex-row items-center justify-between bg-white/5 border border-white/10 p-5 rounded-3xl mb-8">
          <View className="items-center">
            <Typography variant="caption" className="text-gray-500 mb-1">DESDE</Typography>
            <Typography weight="bold" className={tempStart ? 'text-white' : 'text-white/20'}>
              {tempStart || '---- -- --'}
            </Typography>
          </View>
          <View className="h-8 w-[1px] bg-white/10" />
          <View className="items-center">
            <Typography variant="caption" className="text-gray-500 mb-1">HASTA</Typography>
            <Typography weight="bold" className={tempEnd ? 'text-white' : 'text-white/20'}>
              {tempEnd || '---- -- --'}
            </Typography>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleApply}
          activeOpacity={0.8}
          className="bg-brand-500 py-5 rounded-[24px] items-center mb-4"
        >
          <Typography weight="bold" className="text-white text-lg">Aplicar Rango</Typography>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onClose}
          className="py-4 items-center mb-4"
        >
          <Typography className="text-gray-500">Volver</Typography>
        </TouchableOpacity>
      </ScrollView>
    </BaseBottomSheet>
  );
}
