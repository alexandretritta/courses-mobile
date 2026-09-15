import { lazy, Suspense, useState, type FormEvent } from 'react';
import { Check, Plus, RotateCcw, Trash2, ShoppingCart, ScanBarcode } from 'lucide-react';
import { useShoppingList } from './hooks/useShoppingList';
import type { Store, StoreFilter } from './types';

const ScanModal = lazy(() =>
  import('./components/ScanModal').then((m) => ({ default: m.ScanModal })),
);

const TABS: StoreFilter[] = ['Tous', 'Lidl', 'Super U', 'Autre'];

const storeTone: Record<Store, string> = {
  Lidl: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'Super U': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Autre: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export default function App() {
  const {
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
  } = useShoppingList();

  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [store, setStore] = useState<Store>('Lidl');
  const [price, setPrice] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showScan, setShowScan] = useState(false);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const p = price.trim() ? parseFloat(price.replace(',', '.')) : 0;
    addItem(name, qty, store, p);
    setName('');
    setQty('');
    setPrice('');
    setStore('Lidl');
    setShowAdd(false);
  }

  return (
    <div
      className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-8"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {/* Header */}
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-cyan-400">
            <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Courses
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Liste de la semaine</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Lidl · Super U · Voiron / Saint-Cassien
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-right">
          <p className="text-[11px] text-cyan-300/80">
            {checkedCount}/{totalCount} cochés
          </p>
          <p className="text-lg font-bold text-white">
            {remainingCost.toFixed(2)}&nbsp;€
          </p>
          <p className="text-[10px] text-slate-400">restant</p>
        </div>
      </header>

      {/* Store tabs */}
      <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const active = filter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20'
                  : 'border border-slate-700 bg-surface-2 text-slate-300 active:bg-slate-700'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs ${active ? 'text-slate-700' : 'text-slate-500'}`}>
                {countsByStore[tab]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setShowScan(false);
            setShowAdd((v) => !v);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => {
            setShowAdd(false);
            setShowScan(true);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
        >
          <ScanBarcode className="h-5 w-5" strokeWidth={2.5} />
          Scanner
        </button>
        <button
          type="button"
          onClick={clearChecked}
          disabled={checkedCount === 0}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-600 bg-surface-2 px-3 py-3.5 text-sm font-semibold text-slate-200 disabled:opacity-40 active:scale-[0.98]"
          title="Supprimer les cochés"
          aria-label="Supprimer les cochés"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden min-[420px]:inline">Cochés</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Réinitialiser la liste avec les articles types ?')) {
              resetList();
            }
          }}
          className="flex items-center justify-center rounded-2xl border border-slate-600 bg-surface-2 px-4 py-3.5 text-slate-200 active:scale-[0.98]"
          title="Réinitialiser"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Add form */}
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
          <div className="grid grid-cols-2 gap-2">
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Qté (ex. 1 kg)"
              className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Prix €"
              inputMode="decimal"
              className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
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

      {/* List */}
      <ul className="flex flex-1 flex-col gap-2">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-500">
            Aucun article ici. Ajoute-en un ou change d’onglet.
          </li>
        )}
        {filtered.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
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

      <p className="mt-6 text-center text-[11px] text-slate-600">
        Alexandre Tritta · Liste courses mobile
      </p>

      {showScan && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-slate-950/95" />}>
          <ScanModal
            onClose={() => setShowScan(false)}
            onAdd={(itemName, itemQty, itemStore, itemPrice) => {
              addItem(itemName, itemQty, itemStore, itemPrice);
              setShowScan(false);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
