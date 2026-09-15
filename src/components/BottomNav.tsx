import {
  ScanBarcode,
  Library,
  UtensilsCrossed,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import type { TabId } from '../types';

const TABS: { id: TabId; label: string; Icon: typeof ScanBarcode }[] = [
  { id: 'scanner', label: 'Scanner', Icon: ScanBarcode },
  { id: 'bibliotheque', label: 'Bibliothèque', Icon: Library },
  { id: 'menus', label: 'Mes menus', Icon: UtensilsCrossed },
  { id: 'suggestions', label: 'Suggestions', Icon: Sparkles },
  { id: 'courses', label: 'Courses', Icon: ShoppingCart },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  shopCount?: number;
}

export function BottomNav({ active, onChange, shopCount = 0 }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1 pt-1.5">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(id)}
                className={`relative flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition ${
                  isActive ? 'text-cyan-300' : 'text-slate-500 active:text-slate-300'
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {id === 'courses' && shopCount > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[9px] font-bold text-slate-900">
                      {shopCount > 99 ? '99+' : shopCount}
                    </span>
                  )}
                </span>
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
