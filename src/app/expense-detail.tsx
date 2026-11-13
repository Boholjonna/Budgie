import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppStorage } from '../hooks/StorageContext';
import { CategoryKey, getCategoryByKey } from '../constants/categories';
import Colors from '../constants/colors';
import CategoryPicker from '../components/CategoryPicker';
import { formatAmount, formatDateFull } from '../utils/format';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses, updateExpense, deleteExpense } = useAppStorage();

  const expense = expenses.find((e) => e.id === id);

  const [amount,   setAmount]   = useState(expense?.amount.toString() ?? '');
  const [category, setCategory] = useState<CategoryKey>(expense?.category ?? 'food');
  const [note,     setNote]     = useState(expense?.note ?? '');
  const [date,     setDate]     = useState(expense?.date ?? '');
  const [error,    setError]    = useState('');

  if (!expense) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.muted }}>Expense not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.primary, marginTop: 12 }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = getCategoryByKey(expense.category);

  const handleSave = async () => {
    setError('');
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
      setError('Invalid date. Use YYYY-MM-DD format.');
      return;
    }
    await updateExpense(expense.id, { amount: amt, category, note: note.trim(), date });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(expense.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Details</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: cat.color + '25' }]}>
              <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
            </View>
            <Text style={styles.heroAmount}>-{formatAmount(expense.amount)}</Text>
            <Text style={styles.heroMeta}>{cat.label} · {formatDateFull(expense.date)}</Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.editTitle}>Edit</Text>

          {/* Amount */}
          <View style={styles.group}>
            <Text style={styles.label}>Amount (₱)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(t) => { setAmount(t); setError(''); }}
            />
          </View>

          {/* Category */}
          <View style={styles.group}>
            <Text style={styles.label}>Category</Text>
            <CategoryPicker selected={category} onChange={setCategory} />
          </View>

          {/* Note */}
          <View style={styles.group}>
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              maxLength={80}
              placeholder="Add a note…"
              placeholderTextColor={Colors.muted}
            />
          </View>

          {/* Date */}
          <View style={styles.group}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={(t) => { setDate(t); setError(''); }}
            />
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },

  form: { padding: 16, gap: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', paddingVertical: 8, gap: 6 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  heroAmount: { fontSize: 28, fontWeight: '800', color: Colors.error },
  heroMeta:   { fontSize: 13, color: Colors.muted, textAlign: 'center' },

  divider:   { height: 1, backgroundColor: Colors.border },
  editTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },

  group:    { gap: 8 },
  label:    { fontSize: 14, fontWeight: '600', color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderRadius:    14,
    borderWidth:     2,
    borderColor:     Colors.border,
    paddingHorizontal: 16,
    paddingVertical:  15,
    fontSize:        16,
    color:           Colors.text,
    fontWeight:      '500',
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12,
  },
  errorText: { fontSize: 13, color: Colors.error, fontWeight: '500', flex: 1 },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    16,
    paddingVertical: 18,
    alignItems:      'center',
    shadowColor:     Colors.primary,
    shadowOpacity:   0.5,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       8,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
});
