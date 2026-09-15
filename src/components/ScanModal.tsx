import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ScanBarcode, X, Keyboard, LoaderCircle } from 'lucide-react';
import type { Store } from '../types';
import { listName, lookupProduct, type OffProduct } from '../lib/off';
import {
  cameraErrorMessage,
  isProductBarcode,
  normalizeBarcode,
  startBarcodeScan,
} from '../lib/barcode';

type Phase = 'scan' | 'lookup' | 'result' | 'unknown' | 'net-error';

const storeTone: Record<Store, string> = {
  Lidl: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'Super U': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Autre: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const nutriTone: Record<string, string> = {
  a: 'bg-emerald-500 text-slate-900',
  b: 'bg-lime-400 text-slate-900',
  c: 'bg-yellow-400 text-slate-900',
  d: 'bg-orange-400 text-slate-900',
  e: 'bg-red-500 text-white',
};

interface Props {
  onClose: () => void;
  onAdd: (name: string, qty: string, store: Store, price?: number) => void;
}

export function ScanModal({ onClose, onAdd }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('scan');
  const [camError, setCamError] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [code, setCode] = useState('');
  const [product, setProduct] = useState<OffProduct | null>(null);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    if (phase !== 'scan') return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let stop: (() => void) | undefined;

    void (async () => {
      try {
        const s = await startBarcodeScan(video, (scanned) => {
          if (cancelled) return;
          setCode(scanned);
          setImgBroken(false);
          setPhase('lookup');
        });
        if (cancelled) {
          s();
          return;
        }
        stop = s;
      } catch (err) {
        if (!cancelled) setCamError(cameraErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'lookup' || !code) return;
    let cancelled = false;

    void (async () => {
      try {
        const found = await lookupProduct(code);
        if (cancelled) return;
        if (found) {
          setProduct(found);
          setName(listName(found));
          setQty('1');
          setPrice('');
          setPhase('result');
        } else {
          setProduct(null);
          setName('');
          setQty('1');
          setPrice('');
          setPhase('unknown');
        }
      } catch {
        if (!cancelled) setPhase('net-error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, code]);

  function resetScan() {
    setPhase('scan');
    setCamError(null);
    setManual('');
    setCode('');
    setProduct(null);
    setName('');
    setQty('1');
    setPrice('');
    setImgBroken(false);
  }

  function handleManual(e: FormEvent) {
    e.preventDefault();
    const n = normalizeBarcode(manual);
    if (!isProductBarcode(n)) return;
    setCode(n);
    setImgBroken(false);
    setPhase('lookup');
  }

  function addTo(store: Store) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const p = price.trim() ? parseFloat(price.replace(',', '.')) : 0;
    onAdd(trimmed, qty, store, Number.isNaN(p) ? 0 : p);
  }

  const showCamera = phase === 'scan';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-slate-950/95"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-title"
    >
      <div
        className="flex min-h-dvh w-full max-w-lg flex-col px-4"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ScanBarcode className="h-5 w-5" strokeWidth={2.5} />
            <h2 id="scan-title" className="text-lg font-bold text-white">
              Scanner
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-surface-2 text-slate-200 active:scale-[0.98]"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {showCamera && (
          <>
            <div className="relative mb-3 min-h-[220px] flex-1 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-28 w-[78%] rounded-xl border-2 border-emerald-400/80 shadow-[0_0_0_999px_rgba(2,6,23,0.45)]" />
              </div>
              <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-white/90">
                Vise un code EAN-13 / EAN-8 / UPC
              </p>
            </div>

            {camError ? (
              <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
                {camError}
              </p>
            ) : !window.isSecureContext ? (
              <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
                La caméra nécessite HTTPS (ou localhost). Saisis le code-barres à la main.
              </p>
            ) : (
              <p className="mb-3 text-center text-[11px] text-slate-500">
                Autorise la caméra si le navigateur le demande. HTTPS requis hors localhost.
              </p>
            )}

            <form onSubmit={handleManual} className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Keyboard className="h-3.5 w-3.5" />
                Ou saisis le code
              </label>
              <div className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="Ex. 3017620422003"
                  inputMode="numeric"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!isProductBarcode(manual)}
                  className="shrink-0 rounded-xl bg-emerald-400 px-4 py-3.5 text-sm font-bold text-slate-900 disabled:opacity-40 active:scale-[0.98]"
                >
                  OK
                </button>
              </div>
            </form>
          </>
        )}

        {phase === 'lookup' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-300">
            <LoaderCircle className="h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-sm">Recherche du produit…</p>
            <p className="font-mono text-xs text-slate-500">{code}</p>
          </div>
        )}

        {phase === 'net-error' && (
          <div className="flex flex-1 flex-col justify-center gap-3">
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Impossible de joindre Open Food Facts. Vérifie la connexion et réessaie.
            </p>
            <p className="font-mono text-xs text-slate-500">{code}</p>
            <button
              type="button"
              onClick={resetScan}
              className="rounded-xl border border-slate-600 bg-surface-2 py-3.5 text-sm font-semibold text-slate-200 active:scale-[0.98]"
            >
              Scanner un autre
            </button>
          </div>
        )}

        {(phase === 'result' || phase === 'unknown') && (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
            {phase === 'unknown' || !product ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-100">
                  Produit inconnu — ajoute un nom manuellement
                </p>
                <p className="mt-1 font-mono text-xs text-slate-400">{code}</p>
              </div>
            ) : (
              <ProductCard
                product={product}
                imgBroken={imgBroken}
                onImgError={() => setImgBroken(true)}
              />
            )}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l’article"
              autoFocus={phase === 'unknown'}
              className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Qté"
                className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
              />
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Prix € (optionnel)"
                inputMode="decimal"
                className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              {(['Lidl', 'Super U', 'Autre'] as Store[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={!name.trim()}
                  onClick={() => addTo(s)}
                  className={`rounded-xl border py-3.5 text-sm font-bold active:scale-[0.98] disabled:opacity-40 ${
                    s === 'Lidl'
                      ? 'bg-cyan-400 text-slate-900 border-cyan-400'
                      : storeTone[s]
                  }`}
                >
                  Ajouter à {s}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={resetScan}
              className="py-2 text-center text-sm font-semibold text-slate-400"
            >
              Scanner un autre
            </button>
          </div>
        )}

        <p className="mt-3 text-center text-[10px] text-slate-600">
          Données produits : Open Food Facts (ODbL)
        </p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  imgBroken,
  onImgError,
}: {
  product: OffProduct;
  imgBroken: boolean;
  onImgError: () => void;
}) {
  const grade = product.nutriscore;
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-700 bg-surface-2 p-3">
      {product.imageUrl && !imgBroken ? (
        <img
          src={product.imageUrl}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl bg-slate-800 object-contain"
          referrerPolicy="no-referrer"
          onError={onImgError}
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
          <ScanBarcode className="h-7 w-7" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-white">{product.name}</p>
        {product.brand && (
          <p className="truncate text-sm text-slate-400">{product.brand}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {grade && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                nutriTone[grade] || 'bg-slate-600 text-white'
              }`}
            >
              Nutri-Score {grade}
            </span>
          )}
          {product.quantity && (
            <span className="text-[11px] text-slate-500">{product.quantity}</span>
          )}
        </div>
        <p className="mt-1 font-mono text-[11px] text-slate-500">{product.barcode}</p>
      </div>
    </div>
  );
}
