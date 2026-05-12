import { create } from 'zustand';
import { Asset, PortfolioItem, SimulationResult } from '@/types';
import { generateAllAssets } from '@/lib/utils/assetGenerator';

/**
 * Application state interface
 */
interface AppState {
  // Asset data
  assets: Asset[];
  isAssetsLoaded: boolean;

  // Portfolio state
  portfolio: PortfolioItem[];

  // Simulation results (cached)
  simulationResult: SimulationResult | null;

  // Actions
  initializeAssets: () => void;
  updatePortfolioItem: (assetId: string, shares: number) => void;
  removePortfolioItem: (assetId: string) => void;
  clearPortfolio: () => void;
  setSimulationResult: (result: SimulationResult | null) => void;
}

/**
 * Main application store using Zustand
 * Manages global state for assets, portfolio, and simulations
 */
export const useStore = create<AppState>((set, get) => ({
  // Initial state
  assets: [],
  isAssetsLoaded: false,
  portfolio: [],
  simulationResult: null,

  // Initialize assets (load historical data)
  initializeAssets: () => {
    const assets = generateAllAssets();
    set({ assets, isAssetsLoaded: true });
  },

  // Update or add a portfolio item
  updatePortfolioItem: (assetId: string, shares: number) => {
    const { portfolio } = get();

    if (shares === 0) {
      // Remove item if shares is 0
      set({
        portfolio: portfolio.filter(item => item.assetId !== assetId)
      });
    } else {
      const existingIndex = portfolio.findIndex(item => item.assetId === assetId);

      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...portfolio];
        updated[existingIndex] = { assetId, shares };
        set({ portfolio: updated });
      } else {
        // Add new item
        set({ portfolio: [...portfolio, { assetId, shares }] });
      }
    }

    // Clear simulation when portfolio changes
    set({ simulationResult: null });
  },

  // Remove a portfolio item
  removePortfolioItem: (assetId: string) => {
    const { portfolio } = get();
    set({
      portfolio: portfolio.filter(item => item.assetId !== assetId),
      simulationResult: null
    });
  },

  // Clear entire portfolio
  clearPortfolio: () => {
    set({ portfolio: [], simulationResult: null });
  },

  // Set simulation result
  setSimulationResult: (result: SimulationResult | null) => {
    set({ simulationResult: result });
  }
}));

/**
 * Selector hooks for convenient access to specific state slices
 */

export const useAssets = () => useStore(state => state.assets);
export const usePortfolio = () => useStore(state => state.portfolio);
export const useSimulationResult = () => useStore(state => state.simulationResult);
