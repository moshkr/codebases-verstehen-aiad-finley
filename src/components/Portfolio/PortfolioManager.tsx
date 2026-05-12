import React, { useMemo } from 'react';
import { useStore, useAssets, usePortfolio } from '@/store/useStore';
import { calculatePortfolioHistory } from '@/lib/portfolio';
import { AssetRow } from './AssetRow';
import { PortfolioSummary } from './PortfolioSummary';

/**
 * Portfolio Manager - Left sidebar component
 * Allows users to select assets and adjust weightings
 */
export const PortfolioManager: React.FC = () => {
  const assets = useAssets();
  const portfolio = usePortfolio();
  const updatePortfolioItem = useStore(state => state.updatePortfolioItem);
  const clearPortfolio = useStore(state => state.clearPortfolio);

  // Calculate current portfolio metrics
  const portfolioHistory = useMemo(() => {
    if (portfolio.length === 0 || assets.length === 0) return null;
    return calculatePortfolioHistory(assets, portfolio);
  }, [assets, portfolio]);

  // Get shares for each asset
  const getShares = (assetId: string): number => {
    const item = portfolio.find(p => p.assetId === assetId);
    return item ? item.shares : 0;
  };

  const totalShares = portfolio.reduce((sum, item) => sum + item.shares, 0);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-lg font-bold text-white">Portfolio Builder</h2>
        <p className="text-xs text-blue-100 mt-1">
          Select assets and adjust shares
        </p>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto">
        {assets.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Loading assets...
          </div>
        ) : (
          <div>
            {assets.map(asset => (
              <AssetRow
                key={asset.id}
                asset={asset}
                shares={getShares(asset.id)}
                onSharesChange={updatePortfolioItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <PortfolioSummary
          totalShares={totalShares}
          metrics={portfolioHistory?.metrics || null}
        />

        {portfolio.length > 0 && (
          <button
            onClick={clearPortfolio}
            className="w-full mt-3 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
          >
            Clear Portfolio
          </button>
        )}
      </div>
    </div>
  );
};
