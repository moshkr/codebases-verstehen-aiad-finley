import type { jsPDF } from 'jspdf';
import { Asset, DataPoint, PortfolioHistory, PortfolioItem } from '@/types';
import { GLOBAL_SEED } from '@/constants/assets';
import { formatCurrency, formatPercent, toMonthLabel } from '../utils/format';
import { buildExportFilename } from './download';

type RGB = [number, number, number];

// Brand colors (Tailwind blue-600 → indigo-600, same as the dashboard header)
const BRAND_FROM: RGB = [37, 99, 235];
const BRAND_TO: RGB = [79, 70, 229];
const TEXT_DARK: RGB = [31, 41, 55];
const TEXT_MUTED: RGB = [107, 114, 128];
const GRID: RGB = [229, 231, 235];
const TILE_FILL: RGB = [239, 246, 255];
const TILE_BORDER: RGB = [191, 219, 254];
const POSITIVE: RGB = [22, 163, 74];
const NEGATIVE: RGB = [220, 38, 38];
const WARNING: RGB = [234, 88, 12];

// A4 portrait in mm
const PAGE_WIDTH = 210;
const MARGIN = 15;
const CONTENT_RIGHT = PAGE_WIDTH - MARGIN;

export interface PdfReportInput {
  history: PortfolioHistory;
  assets: Asset[];
  portfolio: PortfolioItem[];
}

/**
 * Builds the one-page PDF summary.
 * jsPDF is loaded on demand so it does not bloat the initial bundle.
 */
export async function buildPortfolioPdf(input: PdfReportInput): Promise<jsPDF> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawHeader(doc, input.history.data);
  drawMetrics(doc, input);
  drawChart(doc, input.history.data);
  drawAssetTable(doc, input);
  drawFooter(doc);

  return doc;
}

/**
 * Generates the PDF summary and starts the download
 */
export async function exportPortfolioPdf(input: PdfReportInput): Promise<void> {
  const doc = await buildPortfolioPdf(input);
  doc.save(buildExportFilename('pdf'));
}

function drawHeader(doc: jsPDF, data: DataPoint[]): void {
  const height = 30;
  const steps = 60;
  const stepWidth = PAGE_WIDTH / steps;

  // jsPDF has no gradients, so we approximate one with thin stripes
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    doc.setFillColor(...mix(BRAND_FROM, BRAND_TO, t));
    doc.rect(i * stepWidth, 0, stepWidth + 0.2, height, 'F');
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Finley', MARGIN, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Portfolio-Bericht', MARGIN, 22);

  const period = `${toMonthLabel(data[0].date)} – ${toMonthLabel(data[data.length - 1].date)}`;
  doc.text(`Erstellt am ${new Date().toLocaleDateString('de-DE')}`, CONTENT_RIGHT, 15, { align: 'right' });
  doc.text(`Zeitraum: ${period}`, CONTENT_RIGHT, 22, { align: 'right' });
}

function drawMetrics(doc: jsPDF, { history, portfolio }: PdfReportInput): void {
  const { metrics } = history;
  const totalShares = portfolio.reduce((sum, item) => sum + item.shares, 0);

  drawSectionTitle(doc, 'Kennzahlen', 38);

  const tiles: { label: string; value: string; color: RGB }[] = [
    { label: 'Aktien gesamt', value: String(totalShares), color: TEXT_DARK },
    { label: 'Endwert', value: formatCurrency(metrics.totalValue), color: TEXT_DARK },
    {
      label: 'Rendite p. a.',
      value: formatPercent(metrics.returnPA),
      color: metrics.returnPA >= 0 ? POSITIVE : NEGATIVE
    },
    { label: 'Volatilität p. a.', value: formatPercent(metrics.volatilityPA), color: WARNING },
    { label: 'Max Drawdown', value: formatPercent(metrics.maxDrawdown), color: NEGATIVE }
  ];

  const gap = 3;
  const top = 41;
  const height = 16;
  const width = (CONTENT_RIGHT - MARGIN - gap * (tiles.length - 1)) / tiles.length;

  tiles.forEach((tile, i) => {
    const x = MARGIN + i * (width + gap);

    doc.setFillColor(...TILE_FILL);
    doc.setDrawColor(...TILE_BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, top, width, height, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(tile.label, x + 3, top + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...tile.color);
    doc.text(tile.value, x + 3, top + 12);
  });
}

function drawChart(doc: jsPDF, data: DataPoint[]): void {
  drawSectionTitle(doc, 'Performance (logarithmische Skala, wie im Dashboard)', 66);

  const left = MARGIN + 20;
  const right = CONTENT_RIGHT;
  const top = 71;
  const bottom = 121;
  const width = right - left;
  const height = bottom - top;

  const values = data.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  let logMin = Math.log10(min);
  let logMax = Math.log10(max);
  if (logMax - logMin < 1e-6) {
    logMin -= 0.05;
    logMax += 0.05;
  }

  const xAt = (i: number) => (data.length > 1 ? left + (i / (data.length - 1)) * width : left);
  const yAt = (v: number) => bottom - ((Math.log10(v) - logMin) / (logMax - logMin)) * height;

  // Y grid + labels
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setLineWidth(0.2);
  for (const tick of logTicks(min, max)) {
    const y = yAt(tick);
    doc.setDrawColor(...GRID);
    doc.line(left, y, right, y);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(formatAxisValue(tick), left - 2, y + 1, { align: 'right' });
  }

  // X labels (years)
  const years = data.map(p => Number(toMonthLabel(p.date).slice(0, 4)));
  const yearStep = niceYearStep(years[years.length - 1] - years[0]);
  years.forEach((year, i) => {
    const isFirstMonthOfYear = i === 0 || years[i - 1] !== year;
    if (isFirstMonthOfYear && year % yearStep === 0) {
      const x = xAt(i);
      doc.setDrawColor(...GRID);
      doc.line(x, top, x, bottom);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(String(year), x, bottom + 4.5, { align: 'center' });
    }
  });

  // Axis frame
  doc.setDrawColor(...TEXT_MUTED);
  doc.line(left, bottom, right, bottom);
  doc.line(left, top, left, bottom);

  // Portfolio line, drawn from the full (not downsampled) data
  if (data.length > 1) {
    const segments: [number, number][] = [];
    for (let i = 1; i < data.length; i++) {
      segments.push([xAt(i) - xAt(i - 1), yAt(values[i]) - yAt(values[i - 1])]);
    }
    doc.setDrawColor(...BRAND_FROM);
    doc.setLineWidth(0.4);
    doc.lines(segments, xAt(0), yAt(values[0]), [1, 1], 'S');
  }
}

function drawAssetTable(doc: jsPDF, { history, assets, portfolio }: PdfReportInput): void {
  drawSectionTitle(doc, 'Assets im Portfolio', 134);

  // Right-aligned number columns
  const columns = {
    shares: 117,
    startPrice: 136,
    endPrice: 155,
    endValue: 177,
    share: CONTENT_RIGHT
  };
  const nameX = MARGIN + 4;
  const nameMaxWidth = columns.shares - 14 - nameX;
  const rowHeight = 5;
  let y = 141;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Asset', nameX, y);
  doc.text('Stück', columns.shares, y, { align: 'right' });
  doc.text('Startkurs', columns.startPrice, y, { align: 'right' });
  doc.text('Endkurs', columns.endPrice, y, { align: 'right' });
  doc.text('Endwert', columns.endValue, y, { align: 'right' });
  doc.text('Anteil', columns.share, y, { align: 'right' });

  doc.setDrawColor(...GRID);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 1.5, CONTENT_RIGHT, y + 1.5);

  const totalValue = history.metrics.totalValue;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  for (const item of portfolio) {
    const asset = assets.find(a => a.id === item.assetId);
    if (!asset || asset.history.length === 0) continue;

    y += rowHeight;
    const startPrice = asset.history[0].value;
    const endPrice = asset.history[asset.history.length - 1].value;
    const endValue = item.shares * endPrice;

    doc.setFillColor(...hexToRgb(asset.color));
    doc.circle(MARGIN + 1.2, y - 1, 1.2, 'F');

    doc.setTextColor(...TEXT_DARK);
    doc.text(truncate(doc, asset.name, nameMaxWidth), nameX, y);
    doc.text(String(item.shares), columns.shares, y, { align: 'right' });
    doc.text(formatCurrency(startPrice), columns.startPrice, y, { align: 'right' });
    doc.text(formatCurrency(endPrice), columns.endPrice, y, { align: 'right' });
    doc.text(formatCurrency(endValue), columns.endValue, y, { align: 'right' });
    doc.text(totalValue > 0 ? formatPercent(endValue / totalValue) : '–', columns.share, y, { align: 'right' });
  }

  // Total row
  y += 2;
  doc.setDrawColor(...GRID);
  doc.line(MARGIN, y, CONTENT_RIGHT, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text('Summe', nameX, y);
  doc.text(String(portfolio.reduce((sum, item) => sum + item.shares, 0)), columns.shares, y, { align: 'right' });
  doc.text(formatCurrency(totalValue), columns.endValue, y, { align: 'right' });
  doc.text(formatPercent(1), columns.share, y, { align: 'right' });
}

function drawFooter(doc: jsPDF): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    `Finley – Finance Simulation Game · Simulierte Kurse (Seed: ${GLOBAL_SEED}), keine echten Marktdaten`,
    PAGE_WIDTH / 2,
    290,
    { align: 'center' }
  );
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...TEXT_DARK);
  doc.text(title, MARGIN, y);
}

/**
 * Tick values for a log axis: 1, 2, 5 × 10^k inside [min, max]
 */
function logTicks(min: number, max: number): number[] {
  const ticks: number[] = [];
  for (let k = Math.floor(Math.log10(min)); k <= Math.ceil(Math.log10(max)); k++) {
    for (const m of [1, 2, 5]) {
      const tick = m * Math.pow(10, k);
      if (tick >= min && tick <= max) ticks.push(tick);
    }
  }
  if (ticks.length > 8) return ticks.filter(t => Math.log10(t) % 1 === 0);
  if (ticks.length < 2) return [min, max];
  return ticks;
}

function formatAxisValue(value: number): string {
  return `${value.toLocaleString('de-DE', { maximumFractionDigits: value >= 10 ? 0 : 2 })} €`;
}

function niceYearStep(spanYears: number): number {
  for (const step of [1, 2, 5, 10, 20, 25, 50]) {
    if (spanYears / step <= 12) return step;
  }
  return 100;
}

function truncate(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let shortened = text;
  while (shortened.length > 0 && doc.getTextWidth(`${shortened}…`) > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened.trimEnd()}…`;
}

function mix(from: RGB, to: RGB, t: number): RGB {
  return [0, 1, 2].map(i => Math.round(from[i] + (to[i] - from[i]) * t)) as RGB;
}

function hexToRgb(hex: string): RGB {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
