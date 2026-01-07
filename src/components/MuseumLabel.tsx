'use client';

import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { LabelData, imageFilters } from '@/types/label';
import { Hand } from 'lucide-react';

interface MuseumLabelProps {
  data: LabelData;
  onChange?: (data: LabelData) => void;
  isExporting?: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
  initialDistance: number;
  initialScale: number;
}

// L字型のコーナー装飾コンポーネント
const CornerDecoration = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const baseClasses = "absolute w-3 h-3 pointer-events-none";
  const lineColor = "border-stone-400/50";
  
  const positionClasses = {
    'top-left': 'top-2 left-2 border-t border-l',
    'top-right': 'top-2 right-2 border-t border-r',
    'bottom-left': 'bottom-2 left-2 border-b border-l',
    'bottom-right': 'bottom-2 right-2 border-b border-r',
  };

  return <div className={`${baseClasses} ${positionClasses[position]} ${lineColor}`} />;
};

const MuseumLabel = forwardRef<HTMLDivElement, MuseumLabelProps>(({ data, onChange, isExporting = false }, ref) => {
  const hasContent = data.title || data.description || data.author || data.year || data.image;
  const hasInfo = data.title || data.author || data.year;
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    initialDistance: 0,
    initialScale: 1,
  });

  // 距離計算（ピンチズーム用）
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // ドラッグ開始
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!onChange) return;
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      startX: clientX,
      startY: clientY,
      startOffsetX: data.imageAdjustment.offsetX,
      startOffsetY: data.imageAdjustment.offsetY,
    }));
  }, [onChange, data.imageAdjustment]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onChange) return;
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        initialDistance: distance,
        initialScale: data.imageAdjustment.scale,
      }));
    }
  }, [onChange, data.imageAdjustment, handleDragStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  // ドラッグ移動
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!onChange || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const deltaX = ((clientX - dragState.startX) / rect.width) * 100;
    const deltaY = ((clientY - dragState.startY) / rect.height) * 100;

    const newOffsetX = Math.max(-50, Math.min(50, dragState.startOffsetX + deltaX));
    const newOffsetY = Math.max(-50, Math.min(50, dragState.startOffsetY + deltaY));

    onChange({
      ...data,
      imageAdjustment: {
        ...data.imageAdjustment,
        offsetX: Math.round(newOffsetX),
        offsetY: Math.round(newOffsetY),
      }
    });
  }, [onChange, data, dragState]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!onChange) return;
    e.preventDefault();
    
    if (e.touches.length === 1 && dragState.isDragging) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && dragState.initialDistance > 0) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scaleRatio = distance / dragState.initialDistance;
      const newScale = Math.max(1, Math.min(2, dragState.initialScale * scaleRatio));

      onChange({
        ...data,
        imageAdjustment: {
          ...data.imageAdjustment,
          scale: Math.round(newScale * 20) / 20,
        }
      });
    }
  }, [onChange, data, dragState, handleMove]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragState.isDragging) {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    }
  }, [dragState.isDragging, handleMove]);

  const handleDragEnd = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      initialDistance: 0,
    }));
  }, []);

  return (
    <div 
      ref={ref}
      className="relative min-h-[500px] p-8 md:p-16 flex flex-col items-center justify-center gap-10"
      style={{ backgroundColor: '#f8f7f5' }}
    >
      {/* 美術館の壁のテクスチャ風の背景 */}
      <div className="absolute inset-0 opacity-10" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
           }} 
      />

      {hasContent ? (
        <>
          {/* 額縁エリア（壁に掛かった絵画） */}
          {data.image && (
            <div className="relative flex justify-center">
              {/* 額縁全体のコンテナ */}
              <div 
                className="relative"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3)) drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
                }}
              >
                {/* 額縁の外枠 - 木目調 */}
                <div 
                  className="relative p-5 md:p-6"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        #8B6914 0%, 
                        #A67C00 5%, 
                        #8B6914 10%, 
                        #6B4423 20%,
                        #5D3A1A 30%,
                        #4A2C0F 50%,
                        #5D3A1A 70%,
                        #6B4423 80%,
                        #8B6914 90%,
                        #A67C00 95%,
                        #8B6914 100%
                      )
                    `,
                  }}
                >
                  {/* 木目テクスチャのオーバーレイ */}
                  <div 
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          90deg,
                          transparent 0px,
                          rgba(0,0,0,0.03) 1px,
                          transparent 2px,
                          transparent 4px
                        ),
                        repeating-linear-gradient(
                          87deg,
                          transparent 0px,
                          rgba(139,105,20,0.1) 2px,
                          transparent 4px,
                          transparent 8px
                        ),
                        repeating-linear-gradient(
                          93deg,
                          transparent 0px,
                          rgba(74,44,15,0.08) 1px,
                          transparent 3px,
                          transparent 12px
                        )
                      `,
                    }}
                  />
                  
                  {/* 額縁の内側の段（面取り部分） - 上 */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-5 md:h-6"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,220,150,0.4) 0%, rgba(0,0,0,0.2) 100%)',
                    }}
                  />
                  {/* 額縁の内側の段 - 下 */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-5 md:h-6"
                    style={{
                      background: 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, rgba(255,220,150,0.1) 100%)',
                    }}
                  />
                  {/* 額縁の内側の段 - 左 */}
                  <div 
                    className="absolute top-0 bottom-0 left-0 w-5 md:w-6"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,220,150,0.3) 0%, rgba(0,0,0,0.15) 100%)',
                    }}
                  />
                  {/* 額縁の内側の段 - 右 */}
                  <div 
                    className="absolute top-0 bottom-0 right-0 w-5 md:w-6"
                    style={{
                      background: 'linear-gradient(270deg, rgba(0,0,0,0.25) 0%, rgba(255,220,150,0.1) 100%)',
                    }}
                  />

                  {/* 金色のインナーライン */}
                  <div 
                    className="relative p-1"
                    style={{
                      background: 'linear-gradient(145deg, #D4AF37 0%, #FFD700 25%, #D4AF37 50%, #B8860B 75%, #D4AF37 100%)',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* インナーの木目ライン */}
                    <div 
                      className="relative p-1"
                      style={{
                        background: 'linear-gradient(145deg, #5D3A1A 0%, #4A2C0F 50%, #3D2409 100%)',
                      }}
                    >
                      {/* マット（余白）- ベルベット風 */}
                      <div 
                        className="relative p-2 md:p-3 overflow-hidden"
                        style={{
                          background: 'linear-gradient(145deg, #f5f5f0 0%, #e8e6e0 100%)',
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {/* 画像本体 - ドラッグ/ピンチ操作対応 */}
                        <div 
                          ref={imageContainerRef}
                          className={`relative w-full flex items-center justify-center overflow-hidden ${onChange && !isExporting ? 'touch-none cursor-grab active:cursor-grabbing' : ''}`}
                          style={{ minHeight: '200px', maxHeight: '24rem' }}
                          onTouchStart={onChange ? handleTouchStart : undefined}
                          onTouchMove={onChange ? handleTouchMove : undefined}
                          onTouchEnd={onChange ? handleDragEnd : undefined}
                          onMouseDown={onChange ? handleMouseDown : undefined}
                          onMouseMove={onChange ? handleMouseMove : undefined}
                          onMouseUp={onChange ? handleDragEnd : undefined}
                          onMouseLeave={onChange ? handleDragEnd : undefined}
                        >
                          <img
                            src={data.image}
                            alt={data.title || '作品画像'}
                            className="max-w-full max-h-96 w-auto h-auto block pointer-events-none select-none object-contain"
                            style={{
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              transform: `translate(${data.imageAdjustment.offsetX}%, ${data.imageAdjustment.offsetY}%) scale(${data.imageAdjustment.scale})`,
                              filter: imageFilters.find(f => f.id === data.imageFilter)?.css || 'none',
                            }}
                            draggable={false}
                          />
                          {/* 操作ヒント（エクスポート時は非表示） */}
                          {onChange && !isExporting && (
                            <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                              <div className="flex items-center justify-center gap-1.5 bg-black/50 text-white text-xs px-2 py-1 rounded-full w-fit mx-auto">
                                <Hand size={12} />
                                <span>ドラッグで移動・ピンチで拡大</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 額縁のコーナー装飾（45度カット風） */}
                <div className="absolute top-0 left-0 w-8 h-8 overflow-hidden pointer-events-none">
                  <div 
                    className="absolute w-12 h-12 -rotate-45 origin-bottom-right"
                    style={{ 
                      background: 'linear-gradient(90deg, rgba(255,220,150,0.2) 0%, transparent 100%)',
                      top: '-6px',
                      left: '-6px',
                    }}
                  />
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
                  <div 
                    className="absolute w-12 h-12 rotate-45 origin-bottom-left"
                    style={{ 
                      background: 'linear-gradient(270deg, rgba(0,0,0,0.15) 0%, transparent 100%)',
                      top: '-6px',
                      right: '-6px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 説明プレート（コンパクトなミュージアムプレート） */}
          <div className="relative">
            {/* プレート本体 - 小さめのアクリル/樹脂プレート */}
            <div 
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 50%, #f5f5f3 100%)',
                boxShadow: `
                  0 1px 0 0 rgba(255,255,255,0.9) inset,
                  0 -1px 0 0 rgba(0,0,0,0.03) inset,
                  0 2px 8px -2px rgba(0,0,0,0.08),
                  0 1px 3px -1px rgba(0,0,0,0.05)
                `,
              }}
            >
              {/* プレート上部のハイライト（光沢感） */}
              <div 
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }}
              />

              {/* コーナー装飾 */}
              <CornerDecoration position="top-left" />
              <CornerDecoration position="top-right" />
              <CornerDecoration position="bottom-left" />
              <CornerDecoration position="bottom-right" />

              {/* コンテンツエリア */}
              <div className="relative z-10 flex flex-row min-h-[60px]">
                {data.description ? (
                  <>
                    {/* 左側：作品情報（50%） */}
                    <div className="w-1/2 px-4 py-3 border-r border-stone-200/60 flex items-center justify-center">
                      <div className="space-y-0.5 text-center w-full">
                        {/* 作品名 */}
                        <h1 className="font-serif text-sm font-semibold text-stone-800 
                                      tracking-wide leading-tight line-clamp-2">
                          {data.title || '無題'}
                        </h1>

                        {/* 作者 */}
                        {data.author && (
                          <p className="text-stone-600 text-xs truncate">
                            {data.author}
                          </p>
                        )}

                        {/* 制作年 */}
                        {data.year && (
                          <p className="text-stone-400 text-xs">
                            {data.year}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 右側：説明文（50%） */}
                    <div className="w-1/2 px-4 py-3 flex items-center">
                      <p className="text-stone-500 text-xs leading-relaxed line-clamp-4">
                        {data.description}
                      </p>
                    </div>
                  </>
                ) : (
                  /* 説明文なし：中央に作品情報のみ */
                  <div className="w-full px-6 py-3 flex items-center justify-center">
                    <div className="space-y-0.5 text-center">
                      {/* 作品名 */}
                      <h1 className="font-serif text-sm font-semibold text-stone-800 
                                    tracking-wide leading-tight">
                        {data.title || '無題'}
                      </h1>

                      {/* 作者と制作年 */}
                      {(data.author || data.year) && (
                        <p className="text-stone-500 text-xs">
                          {data.author}{data.author && data.year && ' · '}{data.year}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* プレート下部のシャドウ（厚み感） */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)' }}
              />
            </div>

            {/* プレート台座（アクリルスタンド風） */}
            <div className="flex justify-center mt-1">
              <div 
                className="w-16 h-1 rounded-b-sm"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
                  boxShadow: '0 1px 2px -1px rgba(0,0,0,0.06)',
                }}
              />
            </div>
          </div>
        </>
      ) : (
        /* 空の状態 */
        <div 
          className="relative overflow-hidden p-8 md:p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 50%, #f5f5f3 100%)',
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.9) inset,
              0 -1px 0 0 rgba(0,0,0,0.03) inset,
              0 2px 8px -2px rgba(0,0,0,0.08),
              0 1px 3px -1px rgba(0,0,0,0.05)
            `,
          }}
        >
          <CornerDecoration position="top-left" />
          <CornerDecoration position="top-right" />
          <CornerDecoration position="bottom-left" />
          <CornerDecoration position="bottom-right" />
          
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100/80 
                          flex items-center justify-center">
              <svg
                className="w-6 h-6 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-stone-400 text-sm font-medium">作品情報を入力してください</p>
          </div>
        </div>
      )}
    </div>
  );
});

MuseumLabel.displayName = 'MuseumLabel';

export default MuseumLabel;
