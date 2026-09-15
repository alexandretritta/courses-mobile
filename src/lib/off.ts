import { emptyNutrients, type Nutrients } from '../types';

export interface OffProduct {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  nutriscore: string | null;
  quantity: string | null;
  nutrients: Nutrients;
}

interface OffNutriments {
  'energy-kcal_100g'?: number;
  'energy-kcal_serving'?: number;
  energy_kcal_100g?: number;
  energy_kcal_serving?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
}

interface OffResponse {
  status: number | string;
  status_verbose?: string;
  product?: {
    product_name?: string;
    product_name_fr?: string;
    generic_name?: string;
    brands?: string;
    image_front_small_url?: string;
    image_front_url?: string;
    nutriscore_grade?: string;
    quantity?: string;
    serving_size?: string;
    nutriments?: OffNutriments;
  };
}

function pickName(product: NonNullable<OffResponse['product']>): string {
  return (
    product.product_name_fr?.trim() ||
    product.product_name?.trim() ||
    product.generic_name?.trim() ||
    ''
  );
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v * 10) / 10;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
  }
  return null;
}

function parseNutrients(product: NonNullable<OffResponse['product']>): Nutrients {
  const n = product.nutriments || {};
  return {
    ...emptyNutrients(),
    kcal100g: num(n['energy-kcal_100g'] ?? n.energy_kcal_100g),
    protein100g: num(n.proteins_100g),
    carbs100g: num(n.carbohydrates_100g),
    fat100g: num(n.fat_100g),
    kcalServing: num(n['energy-kcal_serving'] ?? n.energy_kcal_serving),
    servingSize: product.serving_size?.trim() || null,
  };
}

/** Lookup a supermarket barcode on the public Open Food Facts API (no key). */
export async function lookupProduct(barcode: string): Promise<OffProduct | null> {
  const code = barcode.replace(/\D/g, '');
  if (!code) return null;

  const fields = [
    'product_name',
    'product_name_fr',
    'generic_name',
    'brands',
    'image_front_small_url',
    'image_front_url',
    'nutriscore_grade',
    'quantity',
    'serving_size',
    'nutriments',
  ].join(',');

  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`OFF ${res.status}`);
  }

  const data = (await res.json()) as OffResponse;
  const found =
    data.status === 1 ||
    data.status === 'success' ||
    data.status_verbose === 'product found';
  if (!found || !data.product) return null;

  const name = pickName(data.product);
  if (!name) return null;

  const brand = (data.product.brands || '').split(',')[0]?.trim() || '';
  const grade = (data.product.nutriscore_grade || '').trim().toLowerCase();
  const nutriscore = grade && grade !== 'unknown' && grade !== 'not-applicable' ? grade : null;

  return {
    barcode: code,
    name,
    brand,
    imageUrl: data.product.image_front_small_url || data.product.image_front_url || null,
    nutriscore,
    quantity: data.product.quantity?.trim() || null,
    nutrients: parseNutrients(data.product),
  };
}

export function listName(product: OffProduct): string {
  if (product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())) {
    return `${product.name} — ${product.brand}`;
  }
  return product.name;
}
