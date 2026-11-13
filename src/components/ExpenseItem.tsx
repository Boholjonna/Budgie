import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { getCategoryByKey } from '../constants/categories';
import { Expense } from '../hooks/useStorage';
import { formatAmount, formatDate } from '../utils/format';

interface Props {
  expense:  Expense;
  onPress?: () => void;
}

export default function ExpenseItem({ expense, onPress }: Props) {
  const cat = getCategoryByKey(expense.category);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: cat.color + '25' }]}>
        <Text style={styles.emoji}>{cat.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.note} numberOfLines={1}>
          {expense.note.trim() || cat.label}
        </Text>
        <Text style={styles.meta}>
          {cat.label} · {formatDate(expense.date)}
        </Text>
      </View>

      {/* Amount */}
      <Text style={styles.amount}>-{formatAmount(expense.amount)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: Colors.surface,
    borderRadius:   16,
    padding:        14,
    marginBottom:   6,
    gap:            12,
    shadowColor:    '#000',
    shadowOpacity:  0.04,
    shadowRadius:   6,
    shadowOffset:   { width: 0, height: 2 },
    elevation:      2,
  },
  iconBox: {
    width:          48,
    height:         48,
    borderRadius:   14,
    alignItems:     'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  info:  { flex: 1 },
  note: {
    fontSize:   15,
    fontWeight: '600',
    color:      Colors.text,
    letterSpacing: -0.2,
  },
  meta: {
    fontSize:  13,
    color:     Colors.muted,
    marginTop: 3,
    fontWeight: '500',
  },
  amount: {
    fontSize:   16,
    fontWeight: '800',
    color:      Colors.error,
    letterSpacing: -0.3,
  },
});
