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
    // 画像要素を事前に処理（CORS対策・モバイル対応）
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(async (img) => {
        if (img.src && img.src.startsWith('data:')) {
          // Data URLの場合はそのまま使用
          return;
        }
        try {
          // 画像をfetchしてData URLに変換
          const response = await fetch(img.src);
          const blob = await response.blob();
          const dataUrl = await blobToDataUrl(blob);
          img.src = dataUrl;
        } catch (e) {
          console.warn('Failed to process image:', e);
        }
      })
    );

    // 少し待機（モバイルでの描画安定のため）
    await new Promise(resolve => setTimeout(resolve, 100));

    // 複数回試行（モバイルでの安定性向上）
    let dataUrl: string | null = null;
    for (let i = 0; i < 3; i++) {
      try {
        dataUrl = await toPng(element, {
          pixelRatio,
          cacheBust: true,
          backgroundColor: '#f8f7f5',
          skipAutoScale: true,
          includeQueryParams: true,
        });
        if (dataUrl) break;
      } catch (e) {
        console.warn(`Attempt ${i + 1} failed:`, e);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    if (!dataUrl) {
      throw new Error('Failed to generate image after multiple attempts');
    }

    // モバイル対応のダウンロード処理
    if (isMobile()) {
      // モバイルでは新しいタブで開く（長押しで保存可能）
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head><title>${filename}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
              <img src="${dataUrl}" style="max-width:100%;height:auto;" />
              <p style="position:fixed;bottom:20px;left:0;right:0;text-align:center;color:#666;font-family:sans-serif;">
                画像を長押しして保存してください
              </p>
            </body>
          </html>
        `);
        newTab.document.close();
      } else {
        // ポップアップがブロックされた場合
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${filename}.png`;
        link.click();
      }
    } else {
      // デスクトップ
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    }
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
