import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { TabId } from '../types';

const NAV_ITEMS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'plans', label: 'Plans' },
  { id: 'orders', label: 'Orders' },
  { id: 'profile', label: 'Profile' },
];

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, cartCount, setIsCartOpen } = useAppData();

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (Single Line Wordmark) */}
        <button
          onClick={() => setActiveTab('home')}
          className="font-display text-xl font-bold tracking-tight text-[#166534] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] rounded-md px-1"
        >
          EcoBite
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#166534] text-[#166534]'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-3.5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#14532D] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="tabular-nums">
              {cartCount > 0 ? `Tray (${cartCount})` : 'Meal Tray'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
