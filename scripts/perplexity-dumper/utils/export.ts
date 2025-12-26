import type { DumpData } from '../types';

export function exportToJSON(
  data: DumpData,
  filename: string,
  pretty: boolean = true
): void {
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export async function exportToJSONGz(
  data: DumpData,
  filename: string
): Promise<void> {
  const json = JSON.stringify(data);
  
  // Use CompressionStream if available (Chrome 80+)
  if ('CompressionStream' in window) {
    const stream = new Blob([json]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const blob = await new Response(compressedStream).blob();
    downloadBlob(blob, `${filename}.json.gz`);
  } else {
    console.warn('CompressionStream not available, falling back to uncompressed JSON');
    await exportToJSON(data, filename, false);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
