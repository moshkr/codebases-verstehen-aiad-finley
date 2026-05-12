import React, { useEffect, useMemo } from 'react';
import { useStore, useAssets, usePortfolio } from '@/store/useStore';
import { calculatePortfolioHistory } from '@/lib/portfolio';
import { PortfolioManager } from '../Portfolio';
import { HistoricalChart } from '../Charts';

/**
 * Main Dashboard Layout
 * Single-page experience with:
 * - Left sidebar: Portfolio Manager
 * - Main area: Historical chart
 */
export const Dashboard: React.FC = () => {
  const initializeAssets = useStore(state => state.initializeAssets);
  const isAssetsLoaded = useStore(state => state.isAssetsLoaded);
  const assets = useAssets();
  const portfolio = usePortfolio();

  // Initialize assets on mount
  useEffect(() => {
    if (!isAssetsLoaded) {
      initializeAssets();
    }
  }, [isAssetsLoaded, initializeAssets]);

  // Calculate portfolio history
  const portfolioHistory = useMemo(() => {
    if (portfolio.length === 0 || assets.length === 0) return null;
    return calculatePortfolioHistory(assets, portfolio);
  }, [assets, portfolio]);

  const hasPortfolio = portfolio.length > 0 && portfolioHistory !== null;

  return (
    <div className="w-full h-screen flex bg-gray-100">
      {/* Left Sidebar - Portfolio Manager */}
      <div className="w-96 h-full flex-shrink-0">
        <PortfolioManager />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col p-4 gap-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white">Finley</h1>
          <p className="text-blue-100 mt-1">
            Finance Simulation Game - Explore diversification, volatility, and time horizons
          </p>
        </div>

        {/* Chart Container */}
        <div className="flex-1 overflow-hidden">
          <div className="bg-white rounded-lg shadow-md p-4 h-full overflow-hidden">
            {hasPortfolio ? (
              <HistoricalChart data={portfolioHistory.data} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Kein Portfolio ausgewählt</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Wählen Sie Aktien aus der linken Seitenleiste aus
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
