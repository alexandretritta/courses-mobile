import type { FoodItem, Nutrients } from '../types';

export function kcalForGrams(n: Nutrients, grams: number): number | null {
  if (n.kcal100g == null || !grams) return null;
  return Math.round((n.kcal100g * grams) / 100);
}

export function proteinForGrams(n: Nutrients, grams: number): number | null {
  if (n.protein100g == null || !grams) return null;
  return Math.round(((n.protein100g * grams) / 100) * 10) / 10;
}

export function macrosForGrams(n: Nutrients, grams: number) {
  const scale = grams / 100;
  return {
    kcal: n.kcal100g != null ? Math.round(n.kcal100g * scale) : null,
    protein: n.protein100g != null ? Math.round(n.protein100g * scale * 10) / 10 : null,
    carbs: n.carbs100g != null ? Math.round(n.carbs100g * scale * 10) / 10 : null,
    fat: n.fat100g != null ? Math.round(n.fat100g * scale * 10) / 10 : null,
  };
}

export function formatKcal(kcal: number | null | undefined): string {
  if (kcal == null || Number.isNaN(kcal)) return '—';
  return `${Math.round(kcal)} kcal`;
}

export function formatGrams(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 1)} kg`;
  return `${Math.round(g)} g`;
}

export function priceForGrams(food: FoodItem, grams: number): number {
  if (!food.estimatedPrice || !food.defaultGrams) return 0;
  return Math.round((food.estimatedPrice * (grams / food.defaultGrams)) * 100) / 100;
}

export function nutriBadgeClass(grade: string | null | undefined): string {
  const g = (grade || '').toLowerCase();
  const map: Record<string, string> = {
    a: 'bg-emerald-500 text-slate-900',
    b: 'bg-lime-400 text-slate-900',
    c: 'bg-yellow-400 text-slate-900',
    d: 'bg-orange-400 text-slate-900',
    e: 'bg-red-500 text-white',
  };
  return map[g] || 'bg-slate-600 text-white';
}

export const storeTone: Record<string, string> = {
  Lidl: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'Super U': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Autre: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};
