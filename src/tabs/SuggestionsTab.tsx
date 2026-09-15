import { Sparkles, Check, X, RotateCcw } from 'lucide-react';
import type { AppData } from '../hooks/useAppData';
import { formatKcal } from '../lib/nutrition';

interface Props {
  data: AppData;
  onAccepted: () => void;
}

export function SuggestionsTab({ data, onAccepted }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-3">
        <div className="mb-1 flex items-center gap-2 text-amber-300">
          <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-xs font-semibold uppercase tracking-wider">Suggestions</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Idées repas cut</h1>
        <p className="mt-1 text-sm text-slate-400">
          Propositions optionnelles high-protein (handball).{' '}
          <strong className="text-slate-300">Accepte</strong> pour créer un menu dans Mes menus
          (+ courses), ou <strong className="text-slate-300">ignore</strong>.
        </p>
      </header>

      <div className="mb-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-100/80">
        Ce ne sont pas des menus imposés — tu construis tout dans « Mes menus ». Ici = inspiration
        rapide.
      </div>

      <div className="mb-3">
        <button
          type="button"
          onClick={() => data.resetSuggestions()}
          className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Réafficher toutes
        </button>
      </div>

      {data.activeSuggestions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-500">
          Plus de suggestions visibles. Réaffiche-les ou crée tes propres menus.
        </div>
      )}

      <ul className="flex flex-col gap-3 pb-4">
        {data.activeSuggestions.map((sug) => (
          <li
            key={sug.id}
            className="rounded-2xl border border-slate-700/80 bg-surface-2 p-4"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
                  {sug.slot}
                </p>
                <h2 className="text-base font-bold text-white">{sug.title}</h2>
              </div>
              <div className="shrink-0 text-right text-xs">
                <p className="font-semibold text-cyan-300">{formatKcal(sug.kcalApprox)}</p>
                <p className="text-emerald-300">~{sug.proteinApprox}g P</p>
              </div>
            </div>
            <p className="mb-2 text-sm text-slate-400">{sug.description}</p>
            <ul className="mb-3 space-y-1">
              {sug.items.map((it) => (
                <li key={it.foodName + it.grams} className="text-xs text-slate-300">
                  · {it.foodName}{' '}
                  <span className="text-slate-500">({it.grams} g)</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  data.acceptSuggestion(sug);
                  onAccepted();
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-400 py-3 text-sm font-bold text-slate-900 active:scale-[0.98]"
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Accepter → Mes menus
              </button>
              <button
                type="button"
                onClick={() => data.dismissSuggestion(sug.id)}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-300"
                aria-label="Ignorer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
