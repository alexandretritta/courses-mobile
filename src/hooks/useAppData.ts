import { useCallback, useEffect, useMemo, useState } from 'react';
import { MEAL_SUGGESTIONS, SEED_FOODS, STORAGE } from '../data/seed';
import { kcalForGrams, priceForGrams, formatGrams } from '../lib/nutrition';
import { loadJson, saveJson } from '../lib/storage';
import type {
  FoodItem,
  MealSlot,
  MealSuggestion,
  Menu,
  MenuEntry,
  ShoppingItem,
  Store,
  StoreFilter,
} from '../types';
import { uid } from '../types';

function loadLibrary(): FoodItem[] {
  const saved = loadJson<FoodItem[] | null>(STORAGE.library, null);
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    return SEED_FOODS.map((f) => ({ ...f, nutrients: { ...f.nutrients } }));
  }
  return saved;
}

function loadMenus(): Menu[] {
  return loadJson<Menu[]>(STORAGE.menus, []);
}

function loadShopping(): ShoppingItem[] {
  return loadJson<ShoppingItem[]>(STORAGE.shopping, []);
}

function loadDismissed(): string[] {
  return loadJson<string[]>(STORAGE.dismissed, []);
}

export function useAppData() {
  const [library, setLibrary] = useState<FoodItem[]>(loadLibrary);
  const [menus, setMenus] = useState<Menu[]>(loadMenus);
  const [shopping, setShopping] = useState<ShoppingItem[]>(loadShopping);
  const [dismissed, setDismissed] = useState<string[]>(loadDismissed);
  const [shopFilter, setShopFilter] = useState<StoreFilter>('Tous');

  useEffect(() => saveJson(STORAGE.library, library), [library]);
  useEffect(() => saveJson(STORAGE.menus, menus), [menus]);
  useEffect(() => saveJson(STORAGE.shopping, shopping), [shopping]);
  useEffect(() => saveJson(STORAGE.dismissed, dismissed), [dismissed]);

  const foodById = useMemo(() => {
    const m = new Map<string, FoodItem>();
    for (const f of library) m.set(f.id, f);
    return m;
  }, [library]);

  const foodByName = useMemo(() => {
    const m = new Map<string, FoodItem>();
    for (const f of library) m.set(f.name.toLowerCase(), f);
    return m;
  }, [library]);

  /* ——— Bibliothèque ——— */
  const upsertFood = useCallback((food: FoodItem) => {
    setLibrary((prev) => {
      const idx = prev.findIndex(
        (f) =>
          f.id === food.id ||
          (food.barcode && f.barcode && f.barcode === food.barcode),
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...food, id: prev[idx].id };
        return next;
      }
      return [food, ...prev];
    });
  }, []);

  const updateFood = useCallback((id: string, patch: Partial<FoodItem>) => {
    setLibrary((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const deleteFood = useCallback((id: string) => {
    setLibrary((prev) => prev.filter((f) => f.id !== id));
    setMenus((prev) =>
      prev.map((m) => ({
        ...m,
        entries: m.entries.filter((e) => e.foodId !== id),
      })),
    );
  }, []);

  const resetLibrary = useCallback(() => {
    setLibrary((prev) => {
      if (prev.length === 0) {
        return SEED_FOODS.map((f) => ({ ...f, nutrients: { ...f.nutrients } }));
      }
      const ids = new Set(prev.map((f) => f.id));
      const names = new Set(prev.map((f) => f.name.toLowerCase()));
      const missing = SEED_FOODS.filter(
        (f) => !ids.has(f.id) && !names.has(f.name.toLowerCase()),
      ).map((f) => ({ ...f, nutrients: { ...f.nutrients } }));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, []);

  const clearLibrary = useCallback(() => {
    setLibrary([]);
  }, []);

  /* ——— Courses (ajout dédupliqué) ——— */
  const addToShopping = useCallback(
    (
      food: FoodItem,
      grams: number,
      opts?: { qtyLabel?: string; store?: Store; price?: number },
    ) => {
      const g = Math.max(1, Math.round(grams || food.defaultGrams || 100));
      const store = opts?.store ?? food.store;
      const qty = opts?.qtyLabel ?? formatGrams(g);
      const kcal = kcalForGrams(food.nutrients, g);
      const price =
        opts?.price != null && !Number.isNaN(opts.price)
          ? opts.price
          : priceForGrams(food, g);

      setShopping((prev) => {
        const existing = prev.find(
          (i) =>
            !i.checked &&
            i.store === store &&
            ((food.id && i.foodId === food.id) ||
              i.name.toLowerCase() === food.name.toLowerCase()),
        );
        if (existing) {
          const newGrams = existing.grams + g;
          const newKcal =
            food.nutrients.kcal100g != null
              ? kcalForGrams(food.nutrients, newGrams)
              : existing.kcal != null && kcal != null
                ? existing.kcal + kcal
                : existing.kcal ?? kcal;
          return prev.map((i) =>
            i.id === existing.id
              ? {
                  ...i,
                  grams: newGrams,
                  qty: formatGrams(newGrams),
                  kcal: newKcal,
                  price: Math.round((i.price + price) * 100) / 100,
                  foodId: i.foodId || food.id,
                }
              : i,
          );
        }
        const item: ShoppingItem = {
          id: uid('shop'),
          foodId: food.id,
          name: food.name,
          qty,
          grams: g,
          store,
          price,
          kcal,
          checked: false,
        };
        return [item, ...prev];
      });
    },
    [],
  );

  const addManualShopping = useCallback(
    (name: string, qty: string, store: Store, price: number, kcal: number | null) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setShopping((prev) => {
        const existing = prev.find(
          (i) =>
            !i.checked &&
            i.store === store &&
            i.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id
              ? {
                  ...i,
                  qty: qty.trim() || i.qty,
                  price: Math.round((i.price + (price || 0)) * 100) / 100,
                  kcal:
                    i.kcal != null && kcal != null
                      ? i.kcal + kcal
                      : i.kcal ?? kcal,
                }
              : i,
          );
        }
        return [
          {
            id: uid('shop'),
            foodId: null,
            name: trimmed,
            qty: qty.trim() || '1',
            grams: 0,
            store,
            price: price || 0,
            kcal,
            checked: false,
          },
          ...prev,
        ];
      });
    },
    [],
  );

  const toggleShop = useCallback((id: string) => {
    setShopping((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  }, []);

  const clearCheckedShop = useCallback(() => {
    setShopping((prev) => prev.filter((i) => !i.checked));
  }, []);

  const clearShopping = useCallback(() => setShopping([]), []);

  const removeShopItem = useCallback((id: string) => {
    setShopping((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /* ——— Menus ——— */
  const createMenu = useCallback((name: string, slot: MealSlot) => {
    const menu: Menu = {
      id: uid('menu'),
      name: name.trim() || 'Nouveau menu',
      slot,
      entries: [],
      createdAt: Date.now(),
    };
    setMenus((prev) => [menu, ...prev]);
    return menu.id;
  }, []);

  const updateMenu = useCallback((id: string, patch: Partial<Pick<Menu, 'name' | 'slot'>>) => {
    setMenus((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const deleteMenu = useCallback((id: string) => {
    setMenus((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addFoodToMenu = useCallback(
    (menuId: string, foodId: string, grams: number, alsoShop = true) => {
      const food = library.find((f) => f.id === foodId);
      if (!food) return;
      const g = Math.max(1, Math.round(grams || food.defaultGrams));
      const entry: MenuEntry = { id: uid('entry'), foodId, grams: g };
      setMenus((prev) =>
        prev.map((m) =>
          m.id === menuId ? { ...m, entries: [...m.entries, entry] } : m,
        ),
      );
      if (alsoShop) addToShopping(food, g);
    },
    [library, addToShopping],
  );

  const updateMenuEntry = useCallback(
    (menuId: string, entryId: string, grams: number) => {
      setMenus((prev) =>
        prev.map((m) =>
          m.id === menuId
            ? {
                ...m,
                entries: m.entries.map((e) =>
                  e.id === entryId ? { ...e, grams: Math.max(1, Math.round(grams)) } : e,
                ),
              }
            : m,
        ),
      );
    },
    [],
  );

  const removeMenuEntry = useCallback((menuId: string, entryId: string) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.id === menuId
          ? { ...m, entries: m.entries.filter((e) => e.id !== entryId) }
          : m,
      ),
    );
  }, []);

  const pushMenuToShopping = useCallback(
    (menuId: string) => {
      const menu = menus.find((m) => m.id === menuId);
      if (!menu) return;
      for (const e of menu.entries) {
        const food = foodById.get(e.foodId);
        if (food) addToShopping(food, e.grams);
      }
    },
    [menus, foodById, addToShopping],
  );

  /* ——— Suggestions ——— */
  const activeSuggestions = useMemo(
    () => MEAL_SUGGESTIONS.filter((s) => !dismissed.includes(s.id)),
    [dismissed],
  );

  const dismissSuggestion = useCallback((id: string) => {
    setDismissed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetSuggestions = useCallback(() => setDismissed([]), []);

  const acceptSuggestion = useCallback(
    (sug: MealSuggestion) => {
      const entries: MenuEntry[] = [];
      for (const item of sug.items) {
        let food = foodByName.get(item.foodName.toLowerCase());
        if (!food) {
          food = SEED_FOODS.find(
            (f) => f.name.toLowerCase() === item.foodName.toLowerCase(),
          );
          if (food) {
            const copy = { ...food, nutrients: { ...food.nutrients } };
            setLibrary((prev) => {
              if (prev.some((p) => p.id === copy.id || p.name === copy.name)) return prev;
              return [...prev, copy];
            });
            food = copy;
          }
        }
        if (!food) continue;
        entries.push({ id: uid('entry'), foodId: food.id, grams: item.grams });
        addToShopping(food, item.grams);
      }
      const menu: Menu = {
        id: uid('menu'),
        name: sug.title,
        slot: sug.slot,
        entries,
        createdAt: Date.now(),
      };
      setMenus((prev) => [menu, ...prev]);
      setDismissed((prev) => (prev.includes(sug.id) ? prev : [...prev, sug.id]));
      return menu.id;
    },
    [foodByName, addToShopping],
  );

  /* ——— Shopping derived ——— */
  const filteredShopping = useMemo(() => {
    if (shopFilter === 'Tous') return shopping;
    return shopping.filter((i) => i.store === shopFilter);
  }, [shopping, shopFilter]);

  const shopStats = useMemo(() => {
    const checkedCount = shopping.filter((i) => i.checked).length;
    const remainingCost = shopping
      .filter((i) => !i.checked)
      .reduce((s, i) => s + (Number(i.price) || 0), 0);
    const remainingKcal = shopping
      .filter((i) => !i.checked && i.kcal != null)
      .reduce((s, i) => s + (i.kcal || 0), 0);
    const counts = { Tous: shopping.length, Lidl: 0, 'Super U': 0, Autre: 0 };
    for (const i of shopping) counts[i.store]++;
    return { checkedCount, totalCount: shopping.length, remainingCost, remainingKcal, counts };
  }, [shopping]);

  return {
    library,
    menus,
    shopping,
    foodById,
    upsertFood,
    updateFood,
    deleteFood,
    resetLibrary,
    clearLibrary,
    addToShopping,
    addManualShopping,
    toggleShop,
    clearCheckedShop,
    clearShopping,
    removeShopItem,
    shopFilter,
    setShopFilter,
    filteredShopping,
    shopStats,
    createMenu,
    updateMenu,
    deleteMenu,
    addFoodToMenu,
    updateMenuEntry,
    removeMenuEntry,
    pushMenuToShopping,
    activeSuggestions,
    dismissSuggestion,
    resetSuggestions,
    acceptSuggestion,
  };
}

export type AppData = ReturnType<typeof useAppData>;
