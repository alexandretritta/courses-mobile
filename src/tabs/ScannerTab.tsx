import { lazy, Suspense, useState } from 'react';
import { ScanBarcode, Keyboard, CheckCircle2 } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import type { FoodItem } from '../types';

const ScanModal = lazy(() =>
  import('../components/ScanModal').then((m) => ({ default: m.ScanModal })),
);

interface Props {
  data: AppData;
  onSaved: () => void;
}

export function ScannerTab({ data, onSaved }: Props) {
  const [open, setOpen] = useState(true);
  const [manual, setManual] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  function handleSave(food: FoodItem) {
    data.upsertFood(food);
    setLastSaved(food.name);
    setOpen(false);
    setManual(false);
    onSaved();
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-4">
        <div className="mb-1 flex items-center gap-2 text-emerald-400">
          <ScanBarcode className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-xs font-semibold uppercase tracking-wider">Scanner</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Code-barres → Bibliothèque</h1>
        <p className="mt-1 text-sm text-slate-400">
          Scanne un produit (Open Food Facts) ou saisis l’EAN. Enregistrement permanent sur cet appareil.
        </p>
      </header>

      {lastSaved && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold">« {lastSaved} » enregistré</p>
            <p className="text-xs text-emerald-200/80">Visible dans Bibliothèque.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setManual(false);
            setOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-4 text-base font-bold text-slate-900 active:scale-[0.98]"
        >
          <ScanBarcode className="h-6 w-6" strokeWidth={2.5} />
          Ouvrir le scanner
        </button>
        <button
          type="button"
          onClick={() => {
            setManual(true);
            setOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-surface-2 py-3.5 text-sm font-semibold text-slate-200 active:scale-[0.98]"
        >
          <Keyboard className="h-5 w-5" />
          Ajout manuel (sans code)
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-700/60 bg-surface-2/50 p-4 text-sm text-slate-400">
        <p className="font-semibold text-slate-300">Astuce</p>
        <p className="mt-1">
          Exemple EAN pour tester : <span className="font-mono text-cyan-300">3017620422003</span> (Nutella).
          Caméra : HTTPS ou localhost.
        </p>
      </div>

      {open && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-slate-950/95" />}>
          <ScanModal
            onClose={() => {
              setOpen(false);
              setManual(false);
            }}
            onSave={handleSave}
            startManual={manual}
          />
        </Suspense>
      )}
    </div>
  );
}
