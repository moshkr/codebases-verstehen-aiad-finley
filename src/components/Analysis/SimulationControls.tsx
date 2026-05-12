import React from 'react';
import { PortfolioMetrics } from '@/types';

interface SimulationControlsProps {
  portfolioMetrics: PortfolioMetrics;
  currentValue: number;
}

/**
 * Controls for running Monte Carlo simulation
 * Currently disabled as advanced simulation logic is integrated directly into historical data.
 */
export const SimulationControls: React.FC<SimulationControlsProps> = () => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Simulation Engine
      </h3>

      <div className="text-xs text-gray-600">
        <p>Advanced stochastic simulation (Regime Switching GBM) is active.</p>
        <p className="mt-2 text-gray-500">
          Historical data includes dynamic market moods and category-specific shock events.
        </p>
      </div>
    </div>
  );
};
