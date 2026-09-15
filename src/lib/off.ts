export interface OffProduct {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  nutriscore: string | null;
  quantity: string | null;
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
    nutriscore_grade?: string;
    quantity?: string;
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
    'nutriscore_grade',
    'quantity',
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
    imageUrl: data.product.image_front_small_url || null,
    nutriscore,
    quantity: data.product.quantity?.trim() || null,
  };
}

export function listName(product: OffProduct): string {
  if (product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())) {
    return `${product.name} — ${product.brand}`;
  }
  return product.name;
}
