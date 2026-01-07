'use client';

import React, { useState, useRef, useCallback } from 'react';
import { RotateCcw, Maximize2, X } from 'lucide-react';
import InputForm from '@/components/InputForm';
import MuseumLabel from '@/components/MuseumLabel';
import { LabelData, defaultLabelData } from '@/types/label';

export default function Home() {
  const [data, setData] = useState<LabelData>(defaultLabelData);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  // 全画面表示（モーダル方式 - モバイル対応）
  const handleFullscreen = useCallback(() => {
    setIsFullscreen(true);
    // スクロールを無効化
    document.body.style.overflow = 'hidden';
  }, []);

  // 全画面終了
  const handleExitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    document.body.style.overflow = '';
  }, []);

  // ESCキーで終了
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleExitFullscreen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handleExitFullscreen]);

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
              <div className="mt-8">
                <button
                  onClick={handleFullscreen}
                  disabled={!hasContent}
                  className="btn-primary w-full"
                >
                  <Maximize2 size={18} />
                  全画面で表示（スクショ保存用）
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
                  {data.image ? '画像をドラッグ/ピンチで調整可能' : 'リアルタイムで反映されます'}
                </span>
              </div>
              
              {/* 通常のプレビュー */}
              <div className="rounded-lg overflow-hidden shadow-lg">
                <MuseumLabel 
                  ref={labelRef} 
                  data={data} 
                  onChange={setData}
                  isExporting={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 全画面モーダル（モバイル対応） */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-900 flex flex-col"
          onClick={handleExitFullscreen}
        >
          {/* 上部：案内と閉じるボタン */}
          <div className="flex-shrink-0 p-4 flex items-center justify-between">
            <p className="text-white text-sm">
              スクリーンショットで保存してください
            </p>
            <button
              onClick={handleExitFullscreen}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* 中央：プレビュー */}
          <div 
            className="flex-1 overflow-auto flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-full max-h-full">
              <MuseumLabel 
                data={data} 
                isExporting={true}
              />
            </div>
          </div>
          
          {/* 下部：タップで閉じるヒント */}
          <div className="flex-shrink-0 p-4 text-center">
            <p className="text-white/60 text-xs">
              画面をタップして戻る
            </p>
          </div>
        </div>
      )}

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
