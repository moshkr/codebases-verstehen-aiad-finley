import { DataPoint } from '@/types';
import { toMonthLabel } from '../utils/format';
import { buildExportFilename, downloadBlob } from './download';

// Semicolon + decimal comma is what German Excel expects;
// Google Sheets detects the semicolon automatically on import
const SEPARATOR = ';';
const DECIMAL_SEPARATOR = ',';

// Byte order mark so Excel reads the file as UTF-8
const UTF8_BOM = '﻿';

/**
 * Builds the CSV content: one row per data point (date + portfolio value)
 */
export function buildPortfolioCsv(data: DataPoint[]): string {
  const header = ['Datum', 'Portfoliowert (EUR)'].join(SEPARATOR);

  const rows = data.map(point =>
    [
      toMonthLabel(point.date),
      point.value.toFixed(2).replace('.', DECIMAL_SEPARATOR)
    ].join(SEPARATOR)
  );

  return [header, ...rows].join('\r\n');
}

/**
 * Exports the full (not downsampled) portfolio history as CSV download
 */
export function exportPortfolioCsv(data: DataPoint[]): void {
  const csv = buildPortfolioCsv(data);
  const blob = new Blob([UTF8_BOM + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, buildExportFilename('csv'));
}
