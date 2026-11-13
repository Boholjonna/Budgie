import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { CategoryKey, Category } from '../constants/categories';

export interface Expense {
  id:        string;
  amount:    number;
  category:  CategoryKey | string; // Allow custom category keys
  note:      string;
  date:      string; // ISO date YYYY-MM-DD
  createdAt: number; // timestamp ms
}

const KEYS = {
  expenses:  'budgie_expenses',
  allowance: 'budgie_allowance',
  categories: 'budgie_custom_categories',
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function useStorage() {
  const [expenses,       setExpenses]       = useState<Expense[]>([]);
  const [dailyAllowance, setDailyAllowance] = useState<number>(0);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loaded,         setLoaded]         = useState(false);

  // ── Load from storage ──
  useEffect(() => {
    (async () => {
      try {
        const [expRaw, allowRaw, catRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.expenses),
          AsyncStorage.getItem(KEYS.allowance),
          AsyncStorage.getItem(KEYS.categories),
        ]);
        if (expRaw)   setExpenses(JSON.parse(expRaw));
        if (allowRaw) setDailyAllowance(parseFloat(allowRaw));
        if (catRaw)   setCustomCategories(JSON.parse(catRaw));
      } catch (e) {
        console.warn('Storage load error:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ── Persist expenses ──
  const persistExpenses = useCallback(async (data: Expense[]) => {
    setExpenses(data);
    await AsyncStorage.setItem(KEYS.expenses, JSON.stringify(data));
  }, []);

  // ── Persist categories ──
  const persistCategories = useCallback(async (data: Category[]) => {
    setCustomCategories(data);
    await AsyncStorage.setItem(KEYS.categories, JSON.stringify(data));
  }, []);

  // ── Allowance ──
  const saveAllowance = useCallback(async (amount: number) => {
    setDailyAllowance(amount);
    await AsyncStorage.setItem(KEYS.allowance, String(amount));
  }, []);

  // ── Add expense ──
  const addExpense = useCallback(
    async (data: Omit<Expense, 'id' | 'createdAt'>) => {
      const newExp: Expense = { ...data, id: generateId(), createdAt: Date.now() };
      await persistExpenses([newExp, ...expenses]);
      return newExp;
    },
    [expenses, persistExpenses]
  );

  // ── Update expense ──
  const updateExpense = useCallback(
    async (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
      const updated = expenses.map((e: Expense) => (e.id === id ? { ...e, ...data } : e));
      await persistExpenses(updated);
    },
    [expenses, persistExpenses]
  );

  // ── Delete expense ──
  const deleteExpense = useCallback(
    async (id: string) => {
      await persistExpenses(expenses.filter((e: Expense) => e.id !== id));
    },
    [expenses, persistExpenses]
  );

  // ── Add custom category ──
  const addCategory = useCallback(
    async (category: Omit<Category, 'key'>) => {
      const key = category.label.toLowerCase().replace(/\s+/g, '_');
      const newCategory: Category = { ...category, key: key as CategoryKey };
      await persistCategories([...customCategories, newCategory]);
      return newCategory;
    },
    [customCategories, persistCategories]
  );

  // ── Delete custom category ──
  const deleteCategory = useCallback(
    async (key: string) => {
      await persistCategories(customCategories.filter((c) => c.key !== key));
    },
    [customCategories, persistCategories]
  );

  // ── Clear all ──
  const clearAll = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.expenses),
      AsyncStorage.removeItem(KEYS.allowance),
      AsyncStorage.removeItem(KEYS.categories),
    ]);
    setExpenses([]);
    setDailyAllowance(0);
    setCustomCategories([]);
  }, []);

  return {
    expenses,
    dailyAllowance,
    customCategories,
    loaded,
    addExpense,
    updateExpense,
    deleteExpense,
    saveAllowance,
    addCategory,
    deleteCategory,
    clearAll,
  };
}
