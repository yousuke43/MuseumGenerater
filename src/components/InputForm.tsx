'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ImagePlus, X, ZoomIn, Move, RotateCcw, Hand } from 'lucide-react';
import { LabelData, defaultImageAdjustment } from '@/types/label';

interface InputFormProps {
  data: LabelData;
  onChange: (data: LabelData) => void;
}

interface TouchState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
  initialDistance: number;
  initialScale: number;
}

export default function InputForm({ data, onChange }: InputFormProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    initialDistance: 0,
    initialScale: 1,
  });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ 
          ...data, 
          image: reader.result as string,
          imageAdjustment: defaultImageAdjustment 
        });
      };
      reader.readAsDataURL(file);
    }
  }, [data, onChange]);

  const handleRemoveImage = useCallback(() => {
    onChange({ ...data, image: null, imageAdjustment: defaultImageAdjustment });
  }, [data, onChange]);

  const handleFieldChange = useCallback((field: keyof LabelData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({ ...data, [field]: e.target.value });
  }, [data, onChange]);

  const handleAdjustmentChange = useCallback((field: 'scale' | 'offsetX' | 'offsetY', value: number) => {
    onChange({
      ...data,
      imageAdjustment: { ...data.imageAdjustment, [field]: value }
    });
  }, [data, onChange]);

  const handleResetAdjustment = useCallback(() => {
    onChange({ ...data, imageAdjustment: defaultImageAdjustment });
  }, [data, onChange]);

  // タッチ距離を計算
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // タッチ開始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // シングルタッチ: ドラッグ開始
      const touch = e.touches[0];
      setTouchState({
        isDragging: true,
        startX: touch.clientX,
        startY: touch.clientY,
        startOffsetX: data.imageAdjustment.offsetX,
        startOffsetY: data.imageAdjustment.offsetY,
        initialDistance: 0,
        initialScale: data.imageAdjustment.scale,
      });
    } else if (e.touches.length === 2) {
      // ピンチ: ズーム開始
      const distance = getDistance(e.touches[0], e.touches[1]);
      setTouchState(prev => ({
        ...prev,
        isDragging: false,
        initialDistance: distance,
        initialScale: data.imageAdjustment.scale,
      }));
    }
  }, [data.imageAdjustment]);

  // タッチ移動
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // スクロール防止
    
    if (e.touches.length === 1 && touchState.isDragging) {
      // ドラッグ移動（transform-origin方式なので符号を反転）
      const touch = e.touches[0];
      const container = imageContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // ドラッグ方向と同じ方向に画像が動くように符号を反転
      const deltaX = -((touch.clientX - touchState.startX) / rect.width) * 100;
      const deltaY = -((touch.clientY - touchState.startY) / rect.height) * 100;

      const newOffsetX = Math.max(-30, Math.min(30, touchState.startOffsetX + deltaX));
      const newOffsetY = Math.max(-30, Math.min(30, touchState.startOffsetY + deltaY));

      onChange({
        ...data,
        imageAdjustment: {
          ...data.imageAdjustment,
          offsetX: Math.round(newOffsetX),
          offsetY: Math.round(newOffsetY),
        }
      });
    } else if (e.touches.length === 2 && touchState.initialDistance > 0) {
      // ピンチズーム
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scaleRatio = distance / touchState.initialDistance;
      const newScale = Math.max(1, Math.min(2, touchState.initialScale * scaleRatio));

      onChange({
        ...data,
        imageAdjustment: {
          ...data.imageAdjustment,
          scale: Math.round(newScale * 20) / 20, // 0.05刻み
        }
      });
    }
  }, [data, onChange, touchState]);

  // タッチ終了
  const handleTouchEnd = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      isDragging: false,
      initialDistance: 0,
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-museum-text mb-6">作品情報</h2>
      </div>

      {/* 画像アップロード */}
      <div>
        <label className="label-text">作品画像</label>
        {data.image ? (
          <div className="space-y-3">
            {/* 額縁風プレビュー - 実際の見た目を再現 */}
            <div className="relative group">
              {/* 額縁外枠 */}
              <div 
                className="p-3 rounded-sm"
                style={{
                  background: 'linear-gradient(145deg, #8B5A2B 0%, #654321 50%, #4A3520 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {/* 額縁内側 */}
                <div
                  className="p-1"
                  style={{
                    background: 'linear-gradient(145deg, #5D3A1A 0%, #4A2C0F 50%, #3D2409 100%)',
                  }}
                >
                  {/* マット */}
                  <div 
                    ref={imageContainerRef}
                    className="relative p-2 touch-none cursor-grab active:cursor-grabbing"
                    style={{
                      background: 'linear-gradient(145deg, #f5f5f0 0%, #e8e6e0 100%)',
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* 画像本体 */}
                    <div className="relative w-full h-40 overflow-hidden">
                      <img
                        src={data.image}
                        alt="作品プレビュー"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        style={{
                          transform: `scale(${data.imageAdjustment.scale})`,
                          transformOrigin: `${50 - data.imageAdjustment.offsetX}% ${50 - data.imageAdjustment.offsetY}%`,
                        }}
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* タッチ操作ヒント（モバイル用） */}
              <div className="absolute bottom-4 left-4 right-14 md:hidden">
                <div className="flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  <Hand size={12} />
                  <span>ドラッグで移動・ピンチで拡大</span>
                </div>
              </div>

              <button
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-2 bg-white/90 rounded-full shadow-md 
                         opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-red-50 hover:text-red-600 z-10"
                aria-label="画像を削除"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* 画像調整コントロール（スライダー） */}
            <div className="bg-stone-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-600">画像調整</span>
                <button
                  onClick={handleResetAdjustment}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <RotateCcw size={12} />
                  リセット
                </button>
              </div>
              
              {/* ズーム */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ZoomIn size={14} className="text-stone-400" />
                  <span className="text-xs text-stone-500 w-12">拡大</span>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={data.imageAdjustment.scale}
                    onChange={(e) => handleAdjustmentChange('scale', parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                  />
                  <span className="text-xs text-stone-400 w-10 text-right">
                    {Math.round(data.imageAdjustment.scale * 100)}%
                  </span>
                </div>
              </div>

              {/* 位置調整 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Move size={14} className="text-stone-400" />
                  <span className="text-xs text-stone-500 w-12">横位置</span>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={data.imageAdjustment.offsetX}
                    onChange={(e) => handleAdjustmentChange('offsetX', parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                  />
                  <span className="text-xs text-stone-400 w-10 text-right">
                    {data.imageAdjustment.offsetX > 0 ? '+' : ''}{data.imageAdjustment.offsetX}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Move size={14} className="text-stone-400" />
                  <span className="text-xs text-stone-500 w-12">縦位置</span>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={data.imageAdjustment.offsetY}
                    onChange={(e) => handleAdjustmentChange('offsetY', parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                  />
                  <span className="text-xs text-stone-400 w-10 text-right">
                    {data.imageAdjustment.offsetY > 0 ? '+' : ''}{data.imageAdjustment.offsetY}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 
                          border-2 border-dashed border-stone-300 rounded-lg cursor-pointer
                          hover:border-museum-accent hover:bg-stone-50/50 transition-all duration-200">
            <ImagePlus className="w-10 h-10 text-stone-400 mb-2" />
            <span className="text-sm text-stone-500">クリックして画像を選択</span>
            <span className="text-xs text-stone-400 mt-1">PNG, JPG, GIF対応</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* 作品名 */}
      <div>
        <label htmlFor="title" className="label-text">
          作品名 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={handleFieldChange('title')}
          placeholder="無題"
          className="input-field"
        />
      </div>

      {/* 説明文 */}
      <div>
        <label htmlFor="description" className="label-text">
          説明文
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={handleFieldChange('description')}
          placeholder="この作品について..."
          rows={4}
          className="input-field resize-none"
        />
      </div>

      {/* 作者名と制作年 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="author" className="label-text">
            作者名
          </label>
          <input
            id="author"
            type="text"
            value={data.author}
            onChange={handleFieldChange('author')}
            placeholder="作者不詳"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="year" className="label-text">
            制作日
          </label>
          <input
            id="year"
            type="text"
            value={data.year}
            onChange={handleFieldChange('year')}
            placeholder="制作日不詳"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}
