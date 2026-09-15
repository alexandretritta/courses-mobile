import type { ReactNode } from 'react';
import { ScanBarcode } from 'lucide-react';
import type { FoodItem } from '../types';
import { formatKcal, nutriBadgeClass, storeTone } from '../lib/nutrition';

interface Props {
  food: FoodItem;
  onClick?: () => void;
  trailing?: ReactNode;
}

export function FoodCard({ food, onClick, trailing }: Props) {
  const kcal = food.nutrients.kcal100g;
  const grade = food.nutriscore;

  const inner = (
    <>
      {food.imageUrl ? (
        <img
          src={food.imageUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl bg-slate-800 object-contain"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
          <ScanBarcode className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-100">{food.name}</p>
        {food.brand ? (
          <p className="truncate text-xs text-slate-400">{food.brand}</p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-cyan-300">
            {formatKcal(kcal)}
            {kcal != null ? '/100g' : ''}
          </span>
          {food.nutrients.protein100g != null && (
            <span className="text-[11px] text-emerald-300/90">
              P {food.nutrients.protein100g}g
            </span>
          )}
          {grade && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${nutriBadgeClass(grade)}`}
            >
              {grade}
            </span>
          )}
          <span
            className={`rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${storeTone[food.store]}`}
          >
            {food.store}
          </span>
        </div>
      </div>
      {trailing}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl border border-slate-700/80 bg-surface-2 px-3 py-3 text-left active:scale-[0.99]"
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-surface-2 px-3 py-3">
      {inner}
    </div>
  );
}
