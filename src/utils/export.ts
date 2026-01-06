import { toPng } from 'html-to-image';

interface ExportOptions {
  filename?: string;
  pixelRatio?: number;
}

export async function exportToPng(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = 'museum-label', pixelRatio = 2 } = options;

  try {
    const dataUrl = await toPng(element, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: '#f5f5f0',
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  }
}

export function sanitizeFilename(name: string): string {
  // ファイル名として使えない文字を除去
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .trim() || 'museum-label';
}
