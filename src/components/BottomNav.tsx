import React from 'react';
import { Home, UtensilsCrossed, CalendarCheck, ReceiptText, User } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { TabId } from '../types';

const TABS: { id: TabId; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'menu', label: 'Menu', Icon: UtensilsCrossed },
  { id: 'plans', label: 'Plans', Icon: CalendarCheck },
  { id: 'orders', label: 'Orders', Icon: ReceiptText },
  { id: 'profile', label: 'Profile', Icon: User },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useAppData();

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe"
    >
      <div className="grid grid-cols-5 h-[60px]">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer ${
                isActive ? 'text-[#166534]' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
              <span className={`text-[11px] mt-0.5 leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
