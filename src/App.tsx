import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { useAppData } from './hooks/useAppData';
import { ScannerTab } from './tabs/ScannerTab';
import { LibraryTab } from './tabs/LibraryTab';
import { MenusTab } from './tabs/MenusTab';
import { SuggestionsTab } from './tabs/SuggestionsTab';
import { CoursesTab } from './tabs/CoursesTab';
import type { TabId } from './types';

export default function App() {
  const data = useAppData();
  const [tab, setTab] = useState<TabId>('bibliotheque');

  return (
    <div
      className="mx-auto flex min-h-dvh max-w-lg flex-col px-4"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingBottom: 'max(5.5rem, calc(4.5rem + env(safe-area-inset-bottom)))',
      }}
    >
      {tab === 'scanner' && (
        <ScannerTab data={data} onSaved={() => setTab('bibliotheque')} />
      )}
      {tab === 'bibliotheque' && <LibraryTab data={data} />}
      {tab === 'menus' && <MenusTab data={data} />}
      {tab === 'suggestions' && (
        <SuggestionsTab data={data} onAccepted={() => setTab('menus')} />
      )}
      {tab === 'courses' && <CoursesTab data={data} />}

      <p className="mt-4 text-center text-[11px] text-slate-600">
        Alexandre Tritta · Cut handball · Voiron
      </p>

      <BottomNav
        active={tab}
        onChange={setTab}
        shopCount={data.shopping.filter((i) => !i.checked).length}
      />
    </div>
  );
}
