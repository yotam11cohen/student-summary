import type { ReactNode } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export function AppShell({ sidebar, main }: AppShellProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header */}
      <header className="flex items-center px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-brand-700 tracking-tight">
          {t('appTitle')}
        </h1>
      </header>

      {/* Language toggle (fixed) */}
      <LanguageToggle />

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-e border-gray-200 flex flex-col overflow-hidden bg-gray-50">
          {sidebar}
        </aside>

        {/* Main workspace */}
        <main className="flex-1 overflow-y-auto p-6">
          {main}
        </main>
      </div>
    </div>
  );
}
