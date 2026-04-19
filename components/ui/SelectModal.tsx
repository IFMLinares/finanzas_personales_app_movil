import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { BaseBottomSheet } from './BaseBottomSheet';

interface Option {
  id: string | number;
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string;
  parentId?: string | number | null;
  hasChildren?: boolean;
}

interface SelectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (option: Option) => void;
  title: string;
  options: Option[];
  selectedValue?: string | number;
  footerLabel?: string;
  onFooterPress?: () => void;
}

export function SelectModal({ 
  isVisible, 
  onClose, 
  onSelect, 
  title, 
  options,
  selectedValue,
  footerLabel,
  onFooterPress
}: SelectModalProps) {
  const [expandedParents, setExpandedParents] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    if (isVisible) {
      // Auto-expand the parent of the selected value if it exists
      if (selectedValue) {
        const selectedOption = options.find(o => o.id === selectedValue);
        if (selectedOption?.parentId) {
          setExpandedParents((prev: Record<string | number, boolean>) => ({ ...prev, [selectedOption.parentId!]: true }));
        }
      }
    }
  }, [isVisible, selectedValue, options]);

  const toggleExpand = (parentId: string | number) => {
    setExpandedParents((prev: Record<string | number, boolean>) => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  const visibleOptions = options.filter(option => {
    if (!option.parentId) return true;
    return expandedParents[option.parentId];
  });

  return (
    <BaseBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title={title}
      maxHeight="85%"
    >
      <View className="px-8 mb-4">
        <ScrollView showsVerticalScrollIndicator={false} className="gap-3">
          {visibleOptions.map((option) => {
            const isSelected = selectedValue === option.id;
            const isParent = option.hasChildren;
            const isChild = !!option.parentId;
            const isExpanded = expandedParents[option.id];

            return (
              <View key={option.id} className={isChild ? "ml-6 mt-1" : "mt-2"}>
                <TouchableOpacity 
                  onPress={() => { 
                    if (isParent && !isChild) {
                      toggleExpand(option.id);
                    } else {
                      onSelect(option); 
                      onClose(); 
                    }
                  }}
                  activeOpacity={0.7}
                  className={`flex-row items-center p-5 rounded-3xl border ${
                    isSelected 
                      ? 'bg-brand-500/10 border-brand-500' 
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  {option.icon && (
                    <View 
                      className="w-10 h-10 rounded-2xl justify-center items-center mr-4"
                      style={{ backgroundColor: option.color ? `${option.color}20` : 'rgba(255,255,255,0.05)' }}
                    >
                      <Ionicons 
                        name={option.icon as any} 
                        size={20} 
                        color={option.color || (isSelected ? '#465fff' : '#94a3b8')} 
                      />
                    </View>
                  )}
                  <View className="flex-1">
                    <Typography 
                      variant="body"
                      weight={isSelected ? "bold" : "semibold"} 
                      className={isSelected ? 'text-brand-500' : 'text-white'}
                    >
                      {option.label}
                    </Typography>
                    {option.sublabel && (
                      <Typography variant="caption" className="text-ink-tertiary mt-0.5">
                        {option.sublabel}
                      </Typography>
                    )}
                  </View>
                  
                  {isParent && !isChild && (
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color="#64748b" 
                      className="ml-2"
                    />
                  )}

                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-brand-500 justify-center items-center ml-2">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {footerLabel && (
          <TouchableOpacity 
            onPress={() => {
              onClose();
              onFooterPress?.();
            }}
            className="mt-6 flex-row items-center justify-center py-4 bg-brand-500/10 rounded-2xl border border-brand-500/20"
          >
            <Ionicons name="add-circle-outline" size={20} color="#465fff" className="mr-2" />
            <Typography weight="bold" className="text-brand-500 ml-2">{footerLabel}</Typography>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={onClose}
          className="mt-3 py-4 bg-white/5 rounded-2xl items-center border border-white/5 mb-4"
        >
          <Typography weight="bold" className="text-ink-secondary">Cancelar</Typography>
        </TouchableOpacity>
      </View>
    </BaseBottomSheet>
  );
}

export default SelectModal;
