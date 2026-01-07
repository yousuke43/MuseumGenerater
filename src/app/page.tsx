'use client';

import React, { useState, useRef, useCallback } from 'react';
import { RotateCcw, Maximize2 } from 'lucide-react';
import InputForm from '@/components/InputForm';
import MuseumLabel from '@/components/MuseumLabel';
import { LabelData, defaultLabelData } from '@/types/label';

export default function Home() {
  const [data, setData] = useState<LabelData>(defaultLabelData);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // 全画面表示
  const handleFullscreen = useCallback(async () => {
    if (!fullscreenContainerRef.current) return;
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await fullscreenContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Fullscreen failed:', error);
      alert('全画面表示に失敗しました');
    }
  }, []);

  // 全画面終了を監視
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
              
              {/* 全画面表示用コンテナ */}
              <div 
                ref={fullscreenContainerRef}
                className={`rounded-lg overflow-hidden shadow-lg ${isFullscreen ? 'flex items-center justify-center bg-stone-800' : ''}`}
              >
                {/* 全画面時の案内 */}
                {isFullscreen && (
                  <div className="absolute top-4 left-0 right-0 text-center z-50 pointer-events-none">
                    <p className="inline-block bg-black/70 text-white text-sm px-4 py-2 rounded-full">
                      スクリーンショットで保存してください（ESCで終了）
                    </p>
                  </div>
                )}
                
                <MuseumLabel 
                  ref={labelRef} 
                  data={data} 
                  onChange={isFullscreen ? undefined : setData}
                  isExporting={isFullscreen}
                />
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
