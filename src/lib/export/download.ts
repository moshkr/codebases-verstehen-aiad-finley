/**
 * Triggers a browser download for the given blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Builds a file name like "finley-portfolio-2026-10-01.csv"
 */
export function buildExportFilename(extension: 'csv' | 'pdf'): string {
  const today = new Date().toISOString().split('T')[0];
  return `finley-portfolio-${today}.${extension}`;
}
