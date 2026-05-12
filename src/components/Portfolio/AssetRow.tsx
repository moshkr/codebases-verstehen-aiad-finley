import React from 'react';
import { Asset } from '@/types';
import { getAssetCategory } from '@/constants/marketEvents';

interface AssetRowProps {
  asset: Asset;
  shares: number;
  onSharesChange: (assetId: string, shares: number) => void;
}

/**
 * Individual asset row with plus/minus buttons for share adjustment
 */
export const AssetRow: React.FC<AssetRowProps> = ({ asset, shares, onSharesChange }) => {
  const category = getAssetCategory(asset.id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Allow empty string for typing, but handle NaN
    if (isNaN(value)) {
      onSharesChange(asset.id, 0);
    } else {
      onSharesChange(asset.id, Math.max(0, Math.min(1000, value)));
    }
  };

  const increment = () => {
    onSharesChange(asset.id, Math.min(1000, shares + 1));
  };

  const decrement = () => {
    onSharesChange(asset.id, Math.max(0, shares - 1));
  };

  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: asset.color }}
            />
            <span className="text-sm font-semibold text-gray-700">{asset.name}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 ml-5">
            {category.replace('-', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
          <span>μ: <span className="font-medium text-gray-700">{(asset.params.mu * 100).toFixed(1)}%</span></span>
          <span className="w-px h-3 bg-gray-200"></span>
          <span>σ: <span className="font-medium text-gray-700">{(asset.params.sigma * 100).toFixed(1)}%</span></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={decrement}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all font-medium"
          aria-label="Decrease shares"
        >
          -
        </button>
        
        <input
          type="number"
          value={shares}
          onChange={handleInputChange}
          className="flex-1 h-8 px-3 text-center text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          min="0"
          max="1000"
        />

        <button
          onClick={increment}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all font-medium"
          aria-label="Increase shares"
        >
          +
        </button>
      </div>
    </div>
  );
};
