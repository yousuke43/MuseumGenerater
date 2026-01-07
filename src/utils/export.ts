import html2canvas from 'html2canvas';

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
    // html2canvasでキャプチャ（モバイルでも安定）
    const canvas = await html2canvas(element, {
      scale: pixelRatio,
      backgroundColor: '#f8f7f5',
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    // Canvasからblobを生成
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create blob'));
      }, 'image/png', 1.0);
    });

    const file = new File([blob], `${filename}.png`, { type: 'image/png' });

    // Web Share API対応チェック（モバイルで写真に直接保存可能）
    if (isMobile() && navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return;
      } catch (e) {
        // ユーザーがキャンセルした場合など
        if ((e as Error).name !== 'AbortError') {
          console.warn('Share failed, falling back:', e);
        } else {
          return; // キャンセルの場合は何もしない
        }
      }
    }

    // フォールバック：通常のダウンロード
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  }
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function sanitizeFilename(name: string): string {
  // ファイル名として使えない文字を除去
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .trim() || 'museum-label';
}
