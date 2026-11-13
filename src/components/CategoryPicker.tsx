import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { CATEGORIES, CategoryKey } from '../constants/categories';

interface Props {
  selected:  CategoryKey;
  onChange:  (key: CategoryKey) => void;
}

export default function CategoryPicker({ selected, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const isSelected = cat.key === selected;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onChange(cat.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            8,
  },
  chip: {
    width:           '22%',
    flexGrow:        1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 10,
    borderRadius:    10,
    borderWidth:     2,
    borderColor:     Colors.border,
    backgroundColor: Colors.surface,
    gap:             4,
  },
  chipSelected: {
    borderColor:     Colors.primary,
    backgroundColor: Colors.primary + '14',
  },
  emoji: { fontSize: 20 },
  label: {
    fontSize:   10,
    fontWeight: '600',
    color:      Colors.muted,
    textAlign:  'center',
  },
  labelSelected: {
    color: Colors.primary,
  },
});
