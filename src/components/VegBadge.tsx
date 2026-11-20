import React from 'react';

export const VegBadge: React.FC<{ isVeg: boolean; showLabel?: boolean }> = ({
  isVeg,
  showLabel = false,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <span
        aria-label={isVeg ? 'Vegetarian' : 'Contains Egg'}
        className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
          isVeg ? 'border-emerald-700' : 'border-amber-700'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-700' : 'bg-amber-700'}`}
        />
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-stone-600">
          {isVeg ? 'Pure Veg' : 'Contains Egg'}
        </span>
      )}
    </span>
  );
};
