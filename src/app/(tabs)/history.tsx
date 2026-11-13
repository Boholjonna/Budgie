import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppStorage } from '../../hooks/StorageContext';
import { CATEGORIES, CategoryKey, getCategoryByKey } from '../../constants/categories';
import Colors from '../../constants/colors';
import { formatDate, formatAmount } from '../../utils/format';

export default function HistoryScreen() {
  const { expenses, customCategories } = useAppStorage();
  const [query,     setQuery]     = useState('');
  const [activecat, setActiveCat] = useState<CategoryKey | 'all'>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const allCategories = [...CATEGORIES, ...customCategories];

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat   = activecat === 'all' || e.category === activecat;
      const matchQuery =
        !query.trim() ||
        e.note.toLowerCase().includes(query.toLowerCase()) ||
        e.category.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [expenses, query, activecat]);

  // Calculate category totals for bar graph
  const categoryTotals = useMemo(() => {
    const totals = new Map<CategoryKey | string, number>();
    filtered.forEach((e) => {
      totals.set(e.category, (totals.get(e.category) || 0) + e.amount);
    });
    
    const maxAmount = Math.max(...Array.from(totals.values()), 1);
    
    return allCategories.map((cat) => ({
      ...cat,
      total: totals.get(cat.key) || 0,
      percentage: ((totals.get(cat.key) || 0) / maxAmount) * 100,
    })).filter((cat) => cat.total > 0);
  }, [filtered, allCategories]);

  const totalSpent = useMemo(() => {
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  }, [filtered]);

  const selectedCategory = activecat === 'all' 
    ? { emoji: '📊', label: 'All Categories' }
    : getCategoryByKey(activecat, customCategories);

  const handleSelectCategory = (cat: CategoryKey | 'all') => {
    setActiveCat(cat);
    setDropdownOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.totalBadge}>{formatAmount(totalSpent)}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions…"
          placeholderTextColor={Colors.muted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Dropdown */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setDropdownOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownEmoji}>{selectedCategory.emoji}</Text>
          <Text style={styles.dropdownText}>{selectedCategory.label}</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setDropdownOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={[styles.modalItem, activecat === 'all' && styles.modalItemActive]}
                onPress={() => handleSelectCategory('all')}
              >
                <Text style={styles.modalEmoji}>📊</Text>
                <Text style={[styles.modalItemText, activecat === 'all' && styles.modalItemTextActive]}>
                  All Categories
                </Text>
                {activecat === 'all' && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>

              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.modalItem, activecat === cat.key && styles.modalItemActive]}
                  onPress={() => handleSelectCategory(cat.key)}
                >
                  <Text style={styles.modalEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.modalItemText, activecat === cat.key && styles.modalItemTextActive]}>
                    {cat.label}
                  </Text>
                  {activecat === cat.key && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              {customCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.modalItem, activecat === cat.key && styles.modalItemActive]}
                  onPress={() => handleSelectCategory(cat.key)}
                >
                  <Text style={styles.modalEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.modalItemText, activecat === cat.key && styles.modalItemTextActive]}>
                    {cat.label}
                  </Text>
                  {activecat === cat.key && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Content */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🐦</Text>
            <Text style={styles.emptyText}>No transactions found.</Text>
          </View>
        ) : (
          <>
            {/* Bar Graph */}
            <View style={styles.graphCard}>
              <Text style={styles.graphTitle}>Spending by Category</Text>
              <View style={styles.graphBars}>
                {categoryTotals.map((cat) => (
                  <View key={cat.key} style={styles.barRow}>
                    <View style={styles.barLabel}>
                      <Text style={styles.barEmoji}>{cat.emoji}</Text>
                      <Text style={styles.barText} numberOfLines={1}>{cat.label}</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${cat.percentage}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                    <Text style={styles.barAmount}>{formatAmount(cat.total)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Transaction List */}
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {filtered.slice(0, 20).map((expense) => {
              const cat = getCategoryByKey(expense.category as CategoryKey, customCategories);
              return (
                <TouchableOpacity
                  key={expense.id}
                  style={styles.item}
                  onPress={() =>
                    router.push({ pathname: '/expense-detail', params: { id: expense.id } })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemEmoji}>{cat.emoji}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNote} numberOfLines={1}>
                      {expense.note.trim() || cat.label}
                    </Text>
                    <Text style={styles.itemDate}>{formatDate(expense.date)}</Text>
                  </View>
                  <Text style={styles.itemAmount}>-{formatAmount(expense.amount)}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingTop: 8, 
    paddingBottom: 4,
  },
  title:  { fontSize: 22, fontWeight: '800', color: Colors.text },
  totalBadge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  searchRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.surface,
    borderRadius:    12,
    marginHorizontal: 16,
    marginTop:   8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical:   9,
    gap:             8,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  searchIcon:  {},
  searchInput: { 
    flex: 1, 
    fontSize: 14, 
    color: Colors.text, 
    padding: 0,
  },

  // Dropdown
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownEmoji: {
    fontSize: 18,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  modalEmoji: {
    fontSize: 22,
  },
  modalItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  modalItemTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  list:        { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Bar Graph
  graphCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  graphBars: {
    gap: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  barEmoji: {
    fontSize: 18,
  },
  barText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  barContainer: {
    flex: 1,
    height: 28,
    backgroundColor: Colors.borderLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  barFill: {
    height: 28,
    borderRadius: 14,
    minWidth: 4,
  },
  barAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    width: 70,
    textAlign: 'right',
  },

  // Transaction List
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemNote: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '500',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.error,
  },

  empty:     { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: Colors.muted },
});
