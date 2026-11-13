import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppStorage } from '../hooks/StorageContext';
import Colors from '../constants/colors';
import { formatAmount } from '../utils/format';

export default function SettingsScreen() {
  const { dailyAllowance, saveAllowance, clearAll } = useAppStorage();

  const [input, setInput] = useState(
    dailyAllowance > 0 ? dailyAllowance.toString() : ''
  );
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const amt = parseFloat(input);
    if (!input || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid daily allowance.');
      return;
    }
    await saveAllowance(amt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data?',
      'This will permanently delete all expenses and reset your allowance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            setInput('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarRow}>
          <Text style={styles.avatar}>🐦</Text>
          <Text style={styles.appName}>Budgie</Text>
          <Text style={styles.appSub}>Student Expense Tracker</Text>
        </View>

        {/* Budget Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BUDGET</Text>

          <View style={styles.currentRow}>
            <Text style={styles.currentLabel}>Current daily allowance</Text>
            <Text style={styles.currentValue}>{formatAmount(dailyAllowance)}</Text>
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Set Daily Allowance (₱)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 200.00"
              placeholderTextColor={Colors.muted}
              keyboardType="decimal-pad"
              value={input}
              onChangeText={(t) => { setInput(t); setSaved(false); }}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Allowance</Text>
          </TouchableOpacity>

          {saved && (
            <View style={styles.successRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.successText}>Allowance saved!</Text>
            </View>
          )}
        </View>

        {/* Data Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DATA</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll} activeOpacity={0.85}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.dangerBtnText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ABOUT</Text>
          <Text style={styles.about}>Budgie v1.0</Text>
          <Text style={styles.aboutSub}>
            Your offline student expense tracker.{'\n'}
            All data is stored locally on your device.
          </Text>
        </View>

      </ScrollView>
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
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },

  body: { padding: 16, gap: 16, paddingBottom: 40 },

  avatarRow: { alignItems: 'center', paddingVertical: 16, gap: 4 },
  avatar:    { fontSize: 56 },
  appName:   { fontSize: 20, fontWeight: '800', color: Colors.text },
  appSub:    { fontSize: 13, color: Colors.muted },

  card: {
    backgroundColor: Colors.surface,
    borderRadius:    16,
    padding:         16,
    gap:             12,
    shadowColor:     '#000',
    shadowOpacity:   0.05,
    shadowRadius:    8,
    elevation:       2,
  },
  cardTitle: {
    fontSize:    11,
    fontWeight:  '700',
    color:       Colors.muted,
    letterSpacing: 1,
  },

  currentRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  currentLabel: { fontSize: 13, color: Colors.muted },
  currentValue: { fontSize: 15, fontWeight: '700', color: Colors.text },

  group: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text },
  input: {
    backgroundColor: Colors.bg,
    borderRadius:    14,
    borderWidth:     2,
    borderColor:     Colors.border,
    paddingHorizontal: 16,
    paddingVertical:   15,
    fontSize:        16,
    color:           Colors.text,
    fontWeight:      '500',
  },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      'center',
    shadowColor:     Colors.primary,
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       6,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },

  successRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  successText: { fontSize: 13, color: Colors.success, fontWeight: '600' },

  dangerBtn: {
    backgroundColor: Colors.error,
    borderRadius:    14,
    paddingVertical: 16,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    shadowColor:     Colors.error,
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       6,
  },
  dangerBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },

  about:    { fontSize: 15, fontWeight: '600', color: Colors.text },
  aboutSub: { fontSize: 13, color: Colors.muted, lineHeight: 20 },
});
