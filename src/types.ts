export type Store = 'Lidl' | 'Super U' | 'Autre';

export type StoreFilter = Store | 'Tous';

export type TabId = 'scanner' | 'bibliotheque' | 'menus' | 'suggestions' | 'courses';

export type MealSlot = 'Petit-déj' | 'Déjeuner' | 'Collation' | 'Dîner' | 'Autre';

export interface Nutrients {
  /** kcal pour 100 g (préféré) */
  kcal100g: number | null;
  protein100g: number | null;
  carbs100g: number | null;
  fat100g: number | null;
  /** kcal par portion si dispo (OFF) */
  kcalServing: number | null;
  servingSize: string | null;
}

export interface FoodItem {
  id: string;
  name: string;
  brand: string;
  barcode: string | null;
  imageUrl: string | null;
  nutriscore: string | null;
  nutrients: Nutrients;
  store: Store;
  /** Prix unitaire estimé (€) pour la qté par défaut */
  estimatedPrice: number;
  /** Quantité par défaut en grammes (menus / courses) */
  defaultGrams: number;
  notes: string;
  createdAt: number;
  /** true si issu du seed initial */
  seeded?: boolean;
}

export interface MenuEntry {
  id: string;
  foodId: string;
  /** Quantité en grammes */
  grams: number;
}

export interface Menu {
  id: string;
  name: string;
  slot: MealSlot;
  entries: MenuEntry[];
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  foodId: string | null;
  name: string;
  /** Libellé qté affiché (ex. "300 g", "2 pots") */
  qty: string;
  /** Grammes pour calcul kcal (0 si inconnu) */
  grams: number;
  store: Store;
  price: number;
  /** kcal pour la quantité demandée */
  kcal: number | null;
  checked: boolean;
}

export interface MealSuggestion {
  id: string;
  title: string;
  description: string;
  slot: MealSlot;
  /** Noms de foods seed (match exact seed name) + grammes */
  items: { foodName: string; grams: number }[];
  proteinApprox: number;
  kcalApprox: number;
}

export function emptyNutrients(): Nutrients {
  return {
    kcal100g: null,
    protein100g: null,
    carbs100g: null,
    fat100g: null,
    kcalServing: null,
    servingSize: null,
  };
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
