import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';

interface DatePickerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  value: Date;
  onSelectDate: (date: Date) => void;
  title?: string;
}

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateDays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startOffset; i += 1) days.push(null);
  for (let i = 1; i <= daysInMonth; i += 1) days.push(new Date(year, month, i));
  return days;
};

export function DatePickerBottomSheet({
  isVisible,
  onClose,
  value,
  onSelectDate,
  title = 'Seleccionar Fecha',
}: DatePickerBottomSheetProps) {
  const [currentDate, setCurrentDate] = useState(value);

  useEffect(() => {
    if (isVisible) setCurrentDate(value);
  }, [isVisible, value]);

  const selectedKey = toDateKey(value);
  const days = generateDays(currentDate);
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleSelect = (date: Date) => {
    const selected = new Date(value);
    selected.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    onSelectDate(selected);
    onClose();
  };

  return (
    <BaseBottomSheet isVisible={isVisible} onClose={onClose} title={title}>
      <View className="px-6 pb-6">
        <View className="flex-row justify-between items-center mb-6 px-2">
          <Typography weight="bold" className="text-white text-lg capitalize">{monthName}</Typography>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row flex-wrap mb-6">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <View key={`${day}-${index}`} className="w-[14.28%] items-center mb-4">
              <Typography variant="caption" className="text-gray-600 font-bold">{day}</Typography>
            </View>
          ))}

          {days.map((day, index) => {
            if (!day) return <View key={index} className="w-[14.28%] h-12" />;
            const active = toDateKey(day) === selectedKey;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelect(day)}
                className="w-[14.28%] h-12 items-center justify-center relative"
              >
                {active && <View className="absolute w-10 h-10 rounded-xl bg-brand-500" />}
                <Typography
                  weight={active ? 'bold' : 'semibold'}
                  className={active ? 'text-white' : 'text-gray-400'}
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {day.getDate()}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={onClose} className="py-4 items-center">
          <Typography className="text-gray-500">Volver</Typography>
        </TouchableOpacity>
      </View>
    </BaseBottomSheet>
  );
}

export default DatePickerBottomSheet;
