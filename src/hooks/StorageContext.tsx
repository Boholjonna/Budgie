import React, { createContext, useContext } from 'react';
import { useStorage } from './useStorage';

type StorageCtx = ReturnType<typeof useStorage>;

const StorageContext = createContext<StorageCtx | null>(null);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const storage = useStorage();
  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
}

export function useAppStorage(): StorageCtx {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error('useAppStorage must be inside StorageProvider');
  return ctx;
}
