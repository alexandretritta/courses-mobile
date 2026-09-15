import { useMemo, useState, lazy, Suspense } from 'react';
import {
  Library,
  Plus,
  ShoppingCart,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Search,
} from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import type { FoodItem, Store } from '../types';
import { emptyNutrients } from '../types';
import { FoodCard } from '../components/FoodCard';
import {
  formatKcal,
  macrosForGrams,
  nutriBadgeClass,
  storeTone,
} from '../lib/nutrition';

const ScanModal = lazy(() =>
  import('../components/ScanModal').then((m) => ({ default: m.ScanModal })),
);

interface Props {
  data: AppData;
}

export function LibraryTab({ data }: Props) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [grams, setGrams] = useState('100');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data.library;
    return data.library.filter(
      (f) =>
        f.name.toLowerCase().includes(s) ||
        f.brand.toLowerCase().includes(s) ||
        (f.barcode && f.barcode.includes(s)),
    );
  }, [data.library, q]);

  function openFood(f: FoodItem) {
    setSelected(f);
    setGrams(String(f.defaultGrams || 100));
    setEditing(false);
  }

  function addToList() {
    if (!selected) return;
    const g = parseInt(grams, 10) || selected.defaultGrams;
    data.addToShopping(selected, g);
    setSelected(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-3">
        <div className="mb-1 flex items-center gap-2 text-cyan-400">
          <Library className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-xs font-semibold uppercase tracking-wider">Bibliothèque</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Mes aliments</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {data.library.length} produit{data.library.length !== 1 ? 's' : ''} · localStorage
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowScan(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-400 px-3 py-2.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Ajouter
          </button>
        </div>
      </header>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher…"
          className="w-full rounded-2xl border border-slate-700 bg-surface-2 py-3 pl-10 pr-4 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
        />
      </div>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (confirm('Ajouter les aliments starter manquants (~15) ?')) {
              data.resetLibrary();
            }
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Seed
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Vider toute la bibliothèque ?')) data.clearLibrary();
          }}
          className="rounded-xl border border-slate-600 bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-400"
        >
          Tout vider
        </button>
      </div>

      <ul className="flex flex-col gap-2 pb-4">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-500">
            Aucun aliment. Scanne un produit ou réinjecte le seed.
          </li>
        )}
        {filtered.map((f) => (
          <li key={f.id}>
            <FoodCard food={f} onClick={() => openFood(f)} />
          </li>
        ))}
      </ul>

      {selected && (
        <FoodDetailSheet
          key={selected.id + String(editing)}
          food={selected}
          grams={grams}
          setGrams={setGrams}
          editing={editing}
          setEditing={setEditing}
          onClose={() => setSelected(null)}
          onAddToList={addToList}
          onSaveEdit={(patch) => {
            data.updateFood(selected.id, patch);
            setSelected({ ...selected, ...patch, nutrients: patch.nutrients ?? selected.nutrients });
            setEditing(false);
          }}
          onDelete={() => {
            if (confirm(`Supprimer « ${selected.name} » ?`)) {
              data.deleteFood(selected.id);
              setSelected(null);
            }
          }}
        />
      )}

      {showScan && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-slate-950/95" />}>
          <ScanModal
            onClose={() => setShowScan(false)}
            onSave={(food) => {
              data.upsertFood(food);
              setShowScan(false);
            }}
            startManual
          />
        </Suspense>
      )}
    </div>
  );
}

function FoodDetailSheet({
  food,
  grams,
  setGrams,
  editing,
  setEditing,
  onClose,
  onAddToList,
  onSaveEdit,
  onDelete,
}: {
  food: FoodItem;
  grams: string;
  setGrams: (v: string) => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  onClose: () => void;
  onAddToList: () => void;
  onSaveEdit: (patch: Partial<FoodItem>) => void;
  onDelete: () => void;
}) {
  const g = parseInt(grams, 10) || food.defaultGrams;
  const macros = macrosForGrams(food.nutrients, g);

  const [name, setName] = useState(food.name);
  const [brand, setBrand] = useState(food.brand);
  const [store, setStore] = useState<Store>(food.store);
  const [kcal, setKcal] = useState(numStr(food.nutrients.kcal100g));
  const [prot, setProt] = useState(numStr(food.nutrients.protein100g));
  const [carbs, setCarbs] = useState(numStr(food.nutrients.carbs100g));
  const [fat, setFat] = useState(numStr(food.nutrients.fat100g));
  const [price, setPrice] = useState(String(food.estimatedPrice || ''));
  const [defG, setDefG] = useState(String(food.defaultGrams));

  function save() {
    const parse = (v: string) => {
      if (!v.trim()) return null;
      const n = parseFloat(v.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };
    onSaveEdit({
      name: name.trim() || food.name,
      brand: brand.trim(),
      store,
      estimatedPrice: parse(price) ?? 0,
      defaultGrams: parseInt(defG, 10) || food.defaultGrams,
      nutrients: {
        ...emptyNutrients(),
        ...food.nutrients,
        kcal100g: parse(kcal),
        protein100g: parse(prot),
        carbs100g: parse(carbs),
        fat100g: parse(fat),
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" role="dialog">
      <div
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-700 bg-slate-900 p-4"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Fiche aliment</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 text-slate-300"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!editing ? (
          <>
            <FoodCard food={food} />
            {food.nutrients.kcalServing != null && (
              <p className="mt-2 text-xs text-cyan-300/80">
                Portion : {formatKcal(food.nutrients.kcalServing)}
                {food.nutrients.servingSize ? ` · ${food.nutrients.servingSize}` : ''}
              </p>
            )}
            {food.nutriscore && (
              <p className="mt-1">
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${nutriBadgeClass(food.nutriscore)}`}
                >
                  Nutri-Score {food.nutriscore}
                </span>
              </p>
            )}

            <label className="mt-4 mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quantité (g)
            </label>
            <input
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              inputMode="numeric"
              className="mb-2 w-full rounded-xl border border-slate-600 bg-surface px-4 py-3 text-base text-white outline-none focus:border-cyan-400"
            />
            <p className="mb-4 text-sm text-slate-300">
              Pour {g} g →{' '}
              <span className="font-semibold text-cyan-300">{formatKcal(macros.kcal)}</span>
              {macros.protein != null && (
                <span className="text-emerald-300"> · P {macros.protein}g</span>
              )}
            </p>

            <button
              type="button"
              onClick={onAddToList}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
            >
              <ShoppingCart className="h-5 w-5" />
              Ajouter aux courses
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-600 py-3 text-sm font-semibold text-slate-200"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/40 px-4 py-3 text-sm font-semibold text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="Nom"
            />
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="Marque"
            />
            <div className="flex gap-2">
              {(['Lidl', 'Super U', 'Autre'] as Store[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStore(s)}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold ${
                    store === s ? storeTone[s] : 'border-slate-600 text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <EditField label="kcal/100g" value={kcal} onChange={setKcal} />
              <EditField label="P/100g" value={prot} onChange={setProt} />
              <EditField label="G/100g" value={carbs} onChange={setCarbs} />
              <EditField label="L/100g" value={fat} onChange={setFat} />
              <EditField label="Prix €" value={price} onChange={setPrice} />
              <EditField label="Défaut g" value={defG} onChange={setDefG} />
            </div>
            <button
              type="button"
              onClick={save}
              className="w-full rounded-xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-900"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="w-full py-2 text-sm text-slate-400"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function numStr(n: number | null | undefined) {
  return n == null ? '' : String(n);
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="w-full rounded-xl border border-slate-600 bg-surface px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
      />
    </div>
  );
}
