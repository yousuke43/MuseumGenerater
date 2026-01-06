'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Download, RotateCcw, Loader2 } from 'lucide-react';
import InputForm from '@/components/InputForm';
import MuseumLabel from '@/components/MuseumLabel';
import { LabelData, defaultLabelData } from '@/types/label';
import { exportToPng, sanitizeFilename } from '@/utils/export';

export default function Home() {
  const [data, setData] = useState<LabelData>(defaultLabelData);
  const [isExporting, setIsExporting] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  // 画像をPNGとしてダウンロード
  const handleExport = useCallback(async () => {
    if (!labelRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const filename = sanitizeFilename(data.title || '作品');
      await exportToPng(labelRef.current, { filename, pixelRatio: 2 });
    } catch (error) {
      console.error('Export failed:', error);
      alert('画像の書き出しに失敗しました');
    } finally {
      setIsExporting(false);
    }
  }, [data.title, isExporting]);

  // リセット
  const handleReset = useCallback(() => {
    if (confirm('すべての入力内容をリセットしますか？')) {
      setData(defaultLabelData);
    }
  }, []);

  const hasContent = data.title || data.description || data.author || data.year || data.image;

  return (
    <main className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-museum-text">
              美術館風ラベルジェネレーター
            </h1>
            <p className="text-xs md:text-sm text-museum-muted mt-0.5">
              あなたの作品を展示品のように演出
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="btn-secondary text-sm px-3 py-2"
              title="リセット"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">リセット</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
          {/* 左側: 入力フォーム */}
          <div className="lg:w-[400px] lg:min-w-[400px] bg-white border-r border-stone-200">
            <div className="p-6 lg:p-8">
              <InputForm data={data} onChange={setData} />
              
              {/* アクションボタン */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleExport}
                  disabled={!hasContent || isExporting}
                  className="btn-primary w-full"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      書き出し中...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      画像を保存する
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 右側: プレビュー */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-museum-muted">プレビュー</h2>
                <span className="text-xs text-museum-muted">
                  リアルタイムで反映されます
                </span>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <MuseumLabel ref={labelRef} data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-white border-t border-stone-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-museum-muted">
            Museum Label Generator © 2024
          </p>
        </div>
      </footer>
    </main>
  );
}
