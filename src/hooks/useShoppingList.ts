import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEED_ITEMS, STORAGE_KEY } from '../data/seed';
import type { ShoppingItem, Store, StoreFilter } from '../types';

function loadItems(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ITEMS.map((i) => ({ ...i }));
    const parsed = JSON.parse(raw) as ShoppingItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SEED_ITEMS.map((i) => ({ ...i }));
    }
    return parsed;
  } catch {
    return SEED_ITEMS.map((i) => ({ ...i }));
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(loadItems);
  const [filter, setFilter] = useState<StoreFilter>('Tous');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === 'Tous') return items;
    return items.filter((i) => i.store === filter);
  }, [items, filter]);

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const remainingCost = items
    .filter((i) => !i.checked)
    .reduce((s, i) => s + (Number(i.price) || 0), 0);

  const toggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  }, []);

  const addItem = useCallback(
    (name: string, qty: string, store: Store, price?: number) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setItems((prev) => [
        {
          id: uid(),
          name: trimmed,
          qty: qty.trim() || '1',
          store,
          price: typeof price === 'number' && !Number.isNaN(price) ? price : 0,
          checked: false,
        },
        ...prev,
      ]);
    },
    [],
  );

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.checked));
  }, []);

  const resetList = useCallback(() => {
    setItems(SEED_ITEMS.map((i) => ({ ...i, checked: false })));
  }, []);

  const countsByStore = useMemo(() => {
    const base = { Tous: items.length, Lidl: 0, 'Super U': 0, Autre: 0 };
    for (const i of items) base[i.store]++;
    return base;
  }, [items]);

  return {
    items,
    filtered,
    filter,
    setFilter,
    checkedCount,
    totalCount,
    remainingCost,
    toggle,
    addItem,
    clearChecked,
    resetList,
    countsByStore,
  };
}
