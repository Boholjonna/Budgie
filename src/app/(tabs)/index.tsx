import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppStorage } from '../../hooks/StorageContext';
import { getCategoryByKey, CATEGORIES, CategoryKey } from '../../constants/categories';
import Colors from '../../constants/colors';
import { formatAmount, formatDate, todayISO } from '../../utils/format';
import DonutChart from '../../components/DonutChart';
import ExpenseItem from '../../components/ExpenseItem';

export default function HomeScreen() {
  const { expenses, dailyAllowance, loaded } = useAppStorage();

  const todayStr = todayISO();

  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === todayStr),
    [expenses, todayStr]
  );

  const spentToday = useMemo(
    () => todayExpenses.reduce((s, e) => s + e.amount, 0),
    [todayExpenses]
  );

  const remaining  = dailyAllowance - spentToday;
  const pct        = dailyAllowance > 0 ? Math.min(spentToday / dailyAllowance, 1) : 0;

  // Category totals for today
  const catTotals = useMemo(() => {
    const map: Record<string, number> = {};
    todayExpenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .map(([catKey, total]) => {
        const cat = getCategoryByKey(catKey as CategoryKey);
        return { catKey, total, label: cat.label, emoji: cat.emoji, color: cat.color };
      })
      .sort((a, b) => b.total - a.total);
  }, [todayExpenses]);

  // Donut slices
  const donutSlices = catTotals.map((c) => ({ value: c.total, color: c.color }));

  // 5 most recent
  const recent = expenses.slice(0, 5);

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Allowance card */}
        <View style={styles.card}>
          <View>
            <Text style={styles.cardLabel}>Daily Allowance</Text>
            <Text style={styles.cardAmount}>{formatAmount(dailyAllowance)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cardLabel}>Remaining Today</Text>
            <Text style={[styles.cardRemaining, remaining < 0 && { color: '#FFCDD2' }]}>
              {formatAmount(remaining)}
            </Text>
          </View>
        </View>

        {/* Donut */}
        <View style={styles.chartRow}>
          <DonutChart
            slices={donutSlices}
            total={spentToday}
            spentPercent={pct}
          />

          {/* Legend */}
          <View style={styles.legend}>
            {catTotals.length === 0 ? (
              <Text style={styles.emptyLegend}>No spending today</Text>
            ) : (
              catTotals.map((c) => (
                <View key={c.catKey} style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: c.color }]} />
                  <Text style={styles.legendLabel} numberOfLines={1}>{c.label}</Text>
                  <Text style={styles.legendAmt}>{formatAmount(c.total)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Category bars */}
        {catTotals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Breakdown</Text>
            <View style={styles.bars}>
              {catTotals.map((c) => {
                const fraction = spentToday > 0 ? c.total / spentToday : 0;
                return (
                  <View key={c.catKey} style={styles.barItem}>
                    <View style={styles.barRow}>
                      <Text style={styles.barLabel}>{c.emoji} {c.label}</Text>
                      <Text style={styles.barAmt}>{formatAmount(c.total)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${fraction * 100}%`, backgroundColor: c.color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/history')}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🐦</Text>
              <Text style={styles.emptyText}>No expenses yet.{'\n'}Tap + to add one.</Text>
            </View>
          ) : (
            recent.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onPress={() =>
                  router.push({ pathname: '/expense-detail', params: { id: expense.id } })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 4 },

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   20,
  },
  greeting: { 
    fontSize: 13, 
    color: Colors.muted,
    fontWeight: '500',
    marginBottom: 2,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: Colors.text,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: Colors.surface,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     '#000',
    shadowOpacity:   0.08,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       3,
  },

  // Allowance card
  card: {
    borderRadius:    20,
    padding:         24,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    backgroundColor: Colors.primary,
    marginBottom:    24,
    shadowColor:     Colors.primary,
    shadowOpacity:   0.5,
    shadowRadius:    20,
    shadowOffset:    { width: 0, height: 8 },
    elevation:       8,
  },
  cardLabel: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.85)', 
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardAmount: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#fff',
    letterSpacing: -0.5,
  },
  cardRemaining: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#fff',
    letterSpacing: -0.3,
  },

  // Chart row
  chartRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            20,
    marginBottom:   20,
    backgroundColor: Colors.surface,
    borderRadius:   20,
    padding:        20,
    shadowColor:    '#000',
    shadowOpacity:  0.06,
    shadowRadius:   12,
    shadowOffset:   { width: 0, height: 4 },
    elevation:      4,
  },
  legend:      { flex: 1, gap: 10 },
  legendRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot:         { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { 
    flex: 1, 
    fontSize: 13, 
    color: Colors.text, 
    fontWeight: '600',
  },
  legendAmt:   { 
    fontSize: 13, 
    fontWeight: '700', 
    color: Colors.text,
  },
  emptyLegend: { 
    fontSize: 13, 
    color: Colors.muted, 
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Category bars
  section:     { marginBottom: 12 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: Colors.text,
    letterSpacing: -0.3,
  },
  viewAll: { 
    fontSize: 13, 
    color: Colors.primary, 
    fontWeight: '700',
  },

  bars: { 
    backgroundColor: Colors.surface, 
    borderRadius: 18, 
    padding: 16, 
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  barItem:     { gap: 6 },
  barRow:      { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel:    { fontSize: 14, fontWeight: '600', color: Colors.text },
  barAmt:      { fontSize: 14, fontWeight: '700', color: Colors.text },
  barTrack:    { 
    height: 8, 
    backgroundColor: Colors.borderLight, 
    borderRadius: 99, 
    overflow: 'hidden',
  },
  barFill:     { height: 8, borderRadius: 99 },

  // Empty
  empty:     { 
    alignItems: 'center', 
    paddingVertical: 48, 
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyIcon: { fontSize: 56 },
  emptyText: { 
    fontSize: 15, 
    color: Colors.muted, 
    textAlign: 'center', 
    lineHeight: 24,
    fontWeight: '500',
  },
});
