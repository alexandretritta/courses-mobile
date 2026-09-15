import { useMemo, useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import type { MealSlot, Menu } from '../types';
import { formatKcal, macrosForGrams } from '../lib/nutrition';

const SLOTS: MealSlot[] = ['Petit-déj', 'Déjeuner', 'Collation', 'Dîner', 'Autre'];

interface Props {
  data: AppData;
}

export function MenusTab({ data }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slot, setSlot] = useState<MealSlot>('Déjeuner');
  const [openId, setOpenId] = useState<string | null>(null);
  const [pickFor, setPickFor] = useState<string | null>(null);
  const [pickGrams, setPickGrams] = useState('150');
  const [pickFoodId, setPickFoodId] = useState('');

  function create() {
    const id = data.createMenu(name || `Menu ${slot}`, slot);
    setName('');
    setShowCreate(false);
    setOpenId(id);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-3">
        <div className="mb-1 flex items-center gap-2 text-cyan-400">
          <UtensilsCrossed className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-xs font-semibold uppercase tracking-wider">Mes menus</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Tes repas</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Compose à partir de la bibliothèque. Ajout → courses auto.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-1.5 rounded-2xl bg-cyan-400 px-3 py-2.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Créer
          </button>
        </div>
      </header>

      {showCreate && (
        <div className="mb-4 space-y-2 rounded-2xl border border-slate-700 bg-surface-2 p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Lundi midi, Post-match…"
            className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
            autoFocus
          />
          <div className="flex flex-wrap gap-1.5">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  slot === s
                    ? 'bg-cyan-400 text-slate-900'
                    : 'border border-slate-600 text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={create}
            className="w-full rounded-xl bg-emerald-400 py-3 text-sm font-bold text-slate-900"
          >
            Créer le menu
          </button>
        </div>
      )}

      {data.menus.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-500">
          Aucun menu. Crée le tien, ou accepte une idée dans <strong>Suggestions</strong>.
        </div>
      )}

      <ul className="flex flex-col gap-3 pb-4">
        {data.menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            data={data}
            open={openId === menu.id}
            onToggle={() => setOpenId(openId === menu.id ? null : menu.id)}
            onAddFood={() => {
              setPickFor(menu.id);
              setPickFoodId(data.library[0]?.id ?? '');
              setPickGrams(String(data.library[0]?.defaultGrams ?? 150));
            }}
          />
        ))}
      </ul>

      {pickFor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div
            className="w-full max-w-lg rounded-t-3xl border border-slate-700 bg-slate-900 p-4"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-white">Ajouter un aliment</h3>
              <button type="button" onClick={() => setPickFor(null)} aria-label="Fermer">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            {data.library.length === 0 ? (
              <p className="text-sm text-slate-400">Bibliothèque vide — scanne d’abord un produit.</p>
            ) : (
              <>
                <select
                  value={pickFoodId}
                  onChange={(e) => {
                    setPickFoodId(e.target.value);
                    const f = data.foodById.get(e.target.value);
                    if (f) setPickGrams(String(f.defaultGrams));
                  }}
                  className="mb-2 w-full rounded-xl border border-slate-600 bg-surface px-3 py-3 text-white"
                >
                  {data.library.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                      {f.nutrients.kcal100g != null ? ` (${f.nutrients.kcal100g} kcal/100g)` : ''}
                    </option>
                  ))}
                </select>
                <label className="mb-1 block text-xs text-slate-400">Quantité (g)</label>
                <input
                  value={pickGrams}
                  onChange={(e) => setPickGrams(e.target.value)}
                  inputMode="numeric"
                  className="mb-3 w-full rounded-xl border border-slate-600 bg-surface px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const g = parseInt(pickGrams, 10) || 100;
                    data.addFoodToMenu(pickFor, pickFoodId, g, true);
                    setPickFor(null);
                  }}
                  className="w-full rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-slate-900"
                >
                  Ajouter (+ courses)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuCard({
  menu,
  data,
  open,
  onToggle,
  onAddFood,
}: {
  menu: Menu;
  data: AppData;
  open: boolean;
  onToggle: () => void;
  onAddFood: () => void;
}) {
  const totals = useMemo(() => {
    let kcal = 0;
    let protein = 0;
    let hasKcal = false;
    for (const e of menu.entries) {
      const f = data.foodById.get(e.foodId);
      if (!f) continue;
      const m = macrosForGrams(f.nutrients, e.grams);
      if (m.kcal != null) {
        kcal += m.kcal;
        hasKcal = true;
      }
      if (m.protein != null) protein += m.protein;
    }
    return { kcal: hasKcal ? kcal : null, protein: Math.round(protein * 10) / 10 };
  }, [menu.entries, data.foodById]);

  return (
    <li className="rounded-2xl border border-slate-700/80 bg-surface-2 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-100">{menu.name}</p>
          <p className="text-xs text-slate-400">
            {menu.slot} · {menu.entries.length} aliment{menu.entries.length !== 1 ? 's' : ''}
            {totals.kcal != null && (
              <span className="text-cyan-300"> · {formatKcal(totals.kcal)}</span>
            )}
            {totals.protein > 0 && (
              <span className="text-emerald-300"> · P {totals.protein}g</span>
            )}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-700/80 px-3 pb-3 pt-2">
          {menu.entries.length === 0 && (
            <p className="mb-2 text-sm text-slate-500">Vide — ajoute des aliments.</p>
          )}
          <ul className="mb-3 space-y-2">
            {menu.entries.map((e) => {
              const f = data.foodById.get(e.foodId);
              const m = f ? macrosForGrams(f.nutrients, e.grams) : null;
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {f?.name ?? 'Aliment supprimé'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {e.grams} g
                      {m?.kcal != null && (
                        <span className="text-cyan-300"> · {formatKcal(m.kcal)}</span>
                      )}
                    </p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={e.grams}
                    onChange={(ev) =>
                      data.updateMenuEntry(menu.id, e.id, parseInt(ev.target.value, 10) || 1)
                    }
                    className="w-16 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-center text-sm text-white"
                    aria-label="Grammes"
                  />
                  <button
                    type="button"
                    onClick={() => data.removeMenuEntry(menu.id, e.id)}
                    className="text-slate-500 active:text-red-300"
                    aria-label="Retirer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAddFood}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-400 py-2.5 text-xs font-bold text-slate-900"
            >
              <Plus className="h-4 w-4" />
              Aliment
            </button>
            <button
              type="button"
              onClick={() => data.pushMenuToShopping(menu.id)}
              disabled={menu.entries.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 px-3 py-2.5 text-xs font-semibold text-cyan-300 disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" />
              Courses
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Supprimer « ${menu.name} » ?`)) data.deleteMenu(menu.id);
              }}
              className="rounded-xl border border-red-500/30 px-3 py-2.5 text-red-300"
              aria-label="Supprimer menu"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
