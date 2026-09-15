import { useState, type FormEvent } from 'react';
import {
  ShoppingCart,
  Check,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import type { Store, StoreFilter } from '../types';
import { formatKcal, storeTone } from '../lib/nutrition';

const TABS: StoreFilter[] = ['Tous', 'Lidl', 'Super U', 'Autre'];

interface Props {
  data: AppData;
}

export function CoursesTab({ data }: Props) {
  const { filteredShopping, shopFilter, setShopFilter, shopStats } = data;
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [store, setStore] = useState<Store>('Lidl');
  const [price, setPrice] = useState('');
  const [kcal, setKcal] = useState('');

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const p = price.trim() ? parseFloat(price.replace(',', '.')) : 0;
    const k = kcal.trim() ? parseFloat(kcal.replace(',', '.')) : null;
    data.addManualShopping(
      name,
      qty,
      store,
      Number.isNaN(p) ? 0 : p,
      k != null && !Number.isNaN(k) ? k : null,
    );
    setName('');
    setQty('');
    setPrice('');
    setKcal('');
    setStore('Lidl');
    setShowAdd(false);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-cyan-400">
            <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
            <span className="text-xs font-semibold uppercase tracking-wider">Courses</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Liste de courses</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Lidl · Super U · Voiron / Saint-Cassien
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-right">
          <p className="text-[11px] text-cyan-300/80">
            {shopStats.checkedCount}/{shopStats.totalCount} cochés
          </p>
          <p className="text-lg font-bold text-white">
            {shopStats.remainingCost.toFixed(2)}&nbsp;€
          </p>
          <p className="text-[10px] text-slate-400">
            restant
            {shopStats.remainingKcal > 0
              ? ` · ${Math.round(shopStats.remainingKcal)} kcal`
              : ''}
          </p>
        </div>
      </header>

      <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const active = shopFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setShopFilter(tab)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20'
                  : 'border border-slate-700 bg-surface-2 text-slate-300 active:bg-slate-700'
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 text-xs ${active ? 'text-slate-700' : 'text-slate-500'}`}
              >
                {shopStats.counts[tab]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Ajouter
        </button>
        <button
          type="button"
          onClick={data.clearCheckedShop}
          disabled={shopStats.checkedCount === 0}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-600 bg-surface-2 px-3 py-3.5 text-sm font-semibold text-slate-200 disabled:opacity-40 active:scale-[0.98]"
          title="Supprimer les cochés"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden min-[420px]:inline">Cochés</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Vider toute la liste de courses ?')) data.clearShopping();
          }}
          className="flex items-center justify-center rounded-2xl border border-slate-600 bg-surface-2 px-4 py-3.5 text-slate-200 active:scale-[0.98]"
          title="Vider"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="mb-4 space-y-3 rounded-2xl border border-slate-700 bg-surface-2 p-4"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l’article"
            className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Qté"
              className="w-full rounded-xl border border-slate-600 bg-surface px-3 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Prix €"
              inputMode="decimal"
              className="w-full rounded-xl border border-slate-600 bg-surface px-3 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
            />
            <input
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder="kcal"
              inputMode="decimal"
              className="w-full rounded-xl border border-slate-600 bg-surface px-3 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
            />
          </div>
          <div className="flex gap-2">
            {(['Lidl', 'Super U', 'Autre'] as Store[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStore(s)}
                className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${
                  store === s
                    ? storeTone[s] + ' ring-1 ring-cyan-400/50'
                    : 'border-slate-600 bg-surface text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
          >
            Ajouter à la liste
          </button>
        </form>
      )}

      <ul className="flex flex-1 flex-col gap-2 pb-2">
        {filteredShopping.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-500">
            Liste vide. Ajoute depuis Bibliothèque / Menus, ou manuellement.
          </li>
        )}
        {filteredShopping.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => data.toggleShop(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3.5 text-left transition active:scale-[0.99] ${
                item.checked
                  ? 'border-slate-800 bg-slate-900/50 opacity-60'
                  : 'border-slate-700/80 bg-surface-2'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                  item.checked
                    ? 'border-emerald-400 bg-emerald-400 text-slate-900'
                    : 'border-slate-500 bg-surface'
                }`}
              >
                {item.checked && <Check className="h-6 w-6" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-base font-semibold ${
                    item.checked ? 'text-slate-500 line-through' : 'text-slate-100'
                  }`}
                >
                  {item.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">{item.qty}</span>
                  {item.kcal != null && (
                    <span className="text-xs font-medium text-cyan-300/90">
                      {formatKcal(item.kcal)}
                    </span>
                  )}
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${storeTone[item.store]}`}
                  >
                    {item.store}
                  </span>
                </div>
              </div>
              <span
                className={`shrink-0 text-sm font-bold ${
                  item.checked ? 'text-slate-600' : 'text-cyan-300'
                }`}
              >
                {item.price > 0 ? `${item.price.toFixed(2)} €` : '—'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
