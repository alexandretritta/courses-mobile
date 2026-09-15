import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ScanBarcode, X, Keyboard, LoaderCircle, Library } from 'lucide-react';
import type { FoodItem, Store } from '../types';
import { emptyNutrients, uid } from '../types';
import { listName, lookupProduct, type OffProduct } from '../lib/off';
import {
  cameraErrorMessage,
  isProductBarcode,
  normalizeBarcode,
  startBarcodeScan,
} from '../lib/barcode';
import { formatKcal, nutriBadgeClass, storeTone } from '../lib/nutrition';

type Phase = 'scan' | 'lookup' | 'result' | 'unknown' | 'net-error' | 'manual';

interface Props {
  onClose: () => void;
  onSave: (food: FoodItem) => void;
  /** Mode ajout manuel sans scan */
  startManual?: boolean;
}

export function ScanModal({ onClose, onSave, startManual = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>(startManual ? 'manual' : 'scan');
  const [camError, setCamError] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [code, setCode] = useState('');
  const [product, setProduct] = useState<OffProduct | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [store, setStore] = useState<Store>('Lidl');
  const [price, setPrice] = useState('');
  const [defaultGrams, setDefaultGrams] = useState('100');
  const [kcal100g, setKcal100g] = useState('');
  const [protein100g, setProtein100g] = useState('');
  const [carbs100g, setCarbs100g] = useState('');
  const [fat100g, setFat100g] = useState('');
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
          setBrand(found.brand);
          setKcal100g(found.nutrients.kcal100g?.toString() ?? '');
          setProtein100g(found.nutrients.protein100g?.toString() ?? '');
          setCarbs100g(found.nutrients.carbs100g?.toString() ?? '');
          setFat100g(found.nutrients.fat100g?.toString() ?? '');
          setDefaultGrams('100');
          setPrice('');
          setPhase('result');
        } else {
          setProduct(null);
          setName('');
          setBrand('');
          setKcal100g('');
          setProtein100g('');
          setCarbs100g('');
          setFat100g('');
          setDefaultGrams('100');
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
    setBrand('');
    setKcal100g('');
    setProtein100g('');
    setCarbs100g('');
    setFat100g('');
    setDefaultGrams('100');
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

  function parseOpt(v: string): number | null {
    if (!v.trim()) return null;
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const grams = parseInt(defaultGrams, 10);
    const p = parseOpt(price) ?? 0;
    const food: FoodItem = {
      id: uid('food'),
      name: trimmed,
      brand: brand.trim(),
      barcode: code || product?.barcode || null,
      imageUrl: product?.imageUrl ?? null,
      nutriscore: product?.nutriscore ?? null,
      nutrients: {
        ...emptyNutrients(),
        kcal100g: parseOpt(kcal100g),
        protein100g: parseOpt(protein100g),
        carbs100g: parseOpt(carbs100g),
        fat100g: parseOpt(fat100g),
        kcalServing: product?.nutrients.kcalServing ?? null,
        servingSize: product?.nutrients.servingSize ?? null,
      },
      store,
      estimatedPrice: p,
      defaultGrams: Number.isFinite(grams) && grams > 0 ? grams : 100,
      notes: '',
      createdAt: Date.now(),
    };
    onSave(food);
  }

  const showCamera = phase === 'scan';
  const editForm = phase === 'result' || phase === 'unknown' || phase === 'manual';

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
              {phase === 'manual' ? 'Ajout manuel' : 'Scanner → Bibliothèque'}
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
            <div className="relative mb-3 min-h-[200px] flex-1 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
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
                Le produit sera enregistré dans ta bibliothèque.
              </p>
            )}

            <form onSubmit={handleManual} className="mb-2 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Keyboard className="h-3.5 w-3.5" />
                Ou saisis le code EAN
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

            <button
              type="button"
              onClick={() => setPhase('manual')}
              className="py-2 text-center text-sm font-semibold text-slate-400"
            >
              Produit inconnu ? Ajout manuel
            </button>
          </>
        )}

        {phase === 'lookup' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-300">
            <LoaderCircle className="h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-sm">Recherche Open Food Facts…</p>
            <p className="font-mono text-xs text-slate-500">{code}</p>
          </div>
        )}

        {phase === 'net-error' && (
          <div className="flex flex-1 flex-col justify-center gap-3">
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Impossible de joindre Open Food Facts. Vérifie la connexion ou ajoute manuellement.
            </p>
            <p className="font-mono text-xs text-slate-500">{code}</p>
            <button
              type="button"
              onClick={() => setPhase('unknown')}
              className="rounded-xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-900 active:scale-[0.98]"
            >
              Ajouter manuellement
            </button>
            <button
              type="button"
              onClick={resetScan}
              className="rounded-xl border border-slate-600 bg-surface-2 py-3.5 text-sm font-semibold text-slate-200 active:scale-[0.98]"
            >
              Scanner un autre
            </button>
          </div>
        )}

        {editForm && (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
            {phase === 'unknown' && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-100">
                  Produit inconnu — complète la fiche
                </p>
                {code && <p className="mt-1 font-mono text-xs text-slate-400">{code}</p>}
              </div>
            )}

            {phase === 'result' && product && (
              <ProductPreview
                product={product}
                imgBroken={imgBroken}
                onImgError={() => setImgBroken(true)}
              />
            )}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du produit"
              autoFocus={phase !== 'result'}
              className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
              required
            />
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Marque (optionnel)"
              className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
            />

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Nutrition (pour 100 g)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="kcal" value={kcal100g} onChange={setKcal100g} />
              <Field label="Protéines g" value={protein100g} onChange={setProtein100g} />
              <Field label="Glucides g" value={carbs100g} onChange={setCarbs100g} />
              <Field label="Lipides g" value={fat100g} onChange={setFat100g} />
            </div>
            {product?.nutrients.kcalServing != null && (
              <p className="text-xs text-slate-400">
                Portion OFF : {formatKcal(product.nutrients.kcalServing)}
                {product.nutrients.servingSize
                  ? ` (${product.nutrients.servingSize})`
                  : ''}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] text-slate-500">Qté défaut (g)</label>
                <input
                  value={defaultGrams}
                  onChange={(e) => setDefaultGrams(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3 text-base text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-500">Prix estimé €</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="optionnel"
                  className="w-full rounded-xl border border-slate-600 bg-surface px-4 py-3 text-base text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
                />
              </div>
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
              type="button"
              disabled={!name.trim()}
              onClick={save}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3.5 text-sm font-bold text-slate-900 disabled:opacity-40 active:scale-[0.98]"
            >
              <Library className="h-5 w-5" />
              Enregistrer dans la bibliothèque
            </button>

            {phase !== 'manual' && (
              <button
                type="button"
                onClick={resetScan}
                className="py-2 text-center text-sm font-semibold text-slate-400"
              >
                Scanner un autre
              </button>
            )}
          </div>
        )}

        <p className="mt-3 text-center text-[10px] text-slate-600">
          Données produits : Open Food Facts (ODbL)
        </p>
      </div>
    </div>
  );
}

function Field({
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
      <label className="mb-1 block text-[11px] text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="w-full rounded-xl border border-slate-600 bg-surface px-3 py-2.5 text-base text-white outline-none focus:border-emerald-400"
      />
    </div>
  );
}

function ProductPreview({
  product,
  imgBroken,
  onImgError,
}: {
  product: OffProduct;
  imgBroken: boolean;
  onImgError: () => void;
}) {
  const grade = product.nutriscore;
  const n = product.nutrients;
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
        {product.brand && <p className="truncate text-sm text-slate-400">{product.brand}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {grade && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${nutriBadgeClass(grade)}`}
            >
              Nutri-Score {grade}
            </span>
          )}
          {product.quantity && (
            <span className="text-[11px] text-slate-500">{product.quantity}</span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-300">
          {n.kcal100g != null && <span>{formatKcal(n.kcal100g)}/100g</span>}
          {n.protein100g != null && <span>P {n.protein100g}g</span>}
          {n.carbs100g != null && <span>G {n.carbs100g}g</span>}
          {n.fat100g != null && <span>L {n.fat100g}g</span>}
        </div>
        {n.kcalServing != null && (
          <p className="mt-0.5 text-[11px] text-cyan-300/80">
            Portion : {formatKcal(n.kcalServing)}
            {n.servingSize ? ` · ${n.servingSize}` : ''}
          </p>
        )}
        <p className="mt-1 font-mono text-[11px] text-slate-500">{product.barcode}</p>
      </div>
    </div>
  );
}
