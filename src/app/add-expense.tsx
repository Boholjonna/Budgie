import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppStorage } from '../hooks/StorageContext';
import { CategoryKey } from '../constants/categories';
import Colors from '../constants/colors';
import CategoryPicker from '../components/CategoryPicker';
import { todayISO } from '../utils/format';

export default function AddExpenseScreen() {
  const { addExpense } = useAppStorage();

  const [amount,   setAmount]   = useState('');
  const [category, setCategory] = useState<CategoryKey | string>('food');
  const [note,     setNote]     = useState('');
  const [date,     setDate]     = useState(todayISO());
  const [error,    setError]    = useState('');

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
    await addExpense({ amount: amt, category, note: note.trim(), date });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Expense</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

          {/* Amount */}
          <View style={styles.group}>
            <Text style={styles.label}>Amount (₱)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.muted}
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
            <Text style={styles.label}>
              Note <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Jollibee lunch"
              placeholderTextColor={Colors.muted}
              value={note}
              onChangeText={setNote}
              maxLength={80}
            />
          </View>

          {/* Date */}
          <View style={styles.group}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2024-01-01"
              placeholderTextColor={Colors.muted}
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

          {/* Save button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Expense</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },

  form: { padding: 16, gap: 20, paddingBottom: 40 },

  group: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text },
  optional: { fontWeight: '400', color: Colors.muted },

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
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    backgroundColor: '#FEE2E2',
    borderRadius:  10,
    padding:       12,
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
