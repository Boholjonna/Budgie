import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { CategoryKey } from '../constants/categories';

export interface Expense {
  id:        string;
  amount:    number;
  category:  CategoryKey;
  note:      string;
  date:      string; // ISO date YYYY-MM-DD
  createdAt: number; // timestamp ms
}

const KEYS = {
  expenses:  'budgie_expenses',
  allowance: 'budgie_allowance',
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function useStorage() {
  const [expenses,       setExpenses]       = useState<Expense[]>([]);
  const [dailyAllowance, setDailyAllowance] = useState<number>(0);
  const [loaded,         setLoaded]         = useState(false);

  // ── Load from storage ──
  useEffect(() => {
    (async () => {
      try {
        const [expRaw, allowRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.expenses),
          AsyncStorage.getItem(KEYS.allowance),
        ]);
        if (expRaw)   setExpenses(JSON.parse(expRaw));
        if (allowRaw) setDailyAllowance(parseFloat(allowRaw));
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

  // ── Clear all ──
  const clearAll = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.expenses),
      AsyncStorage.removeItem(KEYS.allowance),
    ]);
    setExpenses([]);
    setDailyAllowance(0);
  }, []);

  return {
    expenses,
    dailyAllowance,
    loaded,
    addExpense,
    updateExpense,
    deleteExpense,
    saveAllowance,
    clearAll,
  };
}
