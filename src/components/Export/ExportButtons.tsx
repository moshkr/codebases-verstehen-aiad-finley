import React, { useState } from 'react';
import { Asset, PortfolioHistory, PortfolioItem } from '@/types';
import { exportPortfolioCsv } from '@/lib/export/csv';
import { exportPortfolioPdf } from '@/lib/export/pdf';

interface ExportButtonsProps {
  history: PortfolioHistory;
  assets: Asset[];
  portfolio: PortfolioItem[];
}

type ExportFormat = 'csv' | 'pdf';

/**
 * Waits until the browser has painted, so the loading state is visible
 * before a (synchronous) export blocks the main thread
 */
const nextPaint = () =>
  new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));

/**
 * Export buttons for the main chart area (CSV raw data + PDF report)
 */
export const ExportButtons: React.FC<ExportButtonsProps> = ({ history, assets, portfolio }) => {
  const [activeExport, setActiveExport] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runExport = async (format: ExportFormat) => {
    setActiveExport(format);
    setError(null);

    try {
      await nextPaint();
      if (format === 'csv') {
        exportPortfolioCsv(history.data);
      } else {
        await exportPortfolioPdf({ history, assets, portfolio });
      }
    } catch (err) {
      console.error('Export failed', err);
      setError('Export fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setActiveExport(null);
    }
  };

  const isBusy = activeExport !== null;

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}

      <button
        onClick={() => runExport('csv')}
        disabled={isBusy}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {activeExport === 'csv' && <Spinner />}
        {activeExport === 'csv' ? 'Erstelle CSV…' : 'CSV exportieren'}
      </button>

      <button
        onClick={() => runExport('pdf')}
        disabled={isBusy}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {activeExport === 'pdf' && <Spinner />}
        {activeExport === 'pdf' ? 'Erstelle PDF…' : 'PDF-Bericht'}
      </button>
    </div>
  );
};

const Spinner: React.FC = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);
