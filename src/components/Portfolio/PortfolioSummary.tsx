import React from 'react';
import { PortfolioMetrics } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

interface PortfolioSummaryProps {
  totalShares: number;
  metrics: PortfolioMetrics | null;
}

/**
 * Displays summary statistics for the current portfolio
 */
export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ totalShares, metrics }) => {
  if (totalShares === 0 || !metrics) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 text-center">
          Select assets to build your portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Portfolio Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Total Shares:</span>
          <span className="text-sm font-medium text-gray-800">{totalShares}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Current Value:</span>
          <span className="text-sm font-medium text-gray-800">
            {formatCurrency(metrics.totalValue)}
          </span>
        </div>

        <div className="h-px bg-gray-300 my-2" />

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Annual Return:</span>
          <span className={`text-sm font-medium ${metrics.returnPA >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(metrics.returnPA)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Volatility:</span>
          <span className="text-sm font-medium text-orange-600">
            {formatPercent(metrics.volatilityPA)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Max Drawdown:</span>
          <span className="text-sm font-medium text-red-600">
            {formatPercent(metrics.maxDrawdown)}
          </span>
        </div>
      </div>
    </div>
  );
};
