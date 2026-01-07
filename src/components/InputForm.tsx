'use client';

import React, { useCallback } from 'react';
import { ImagePlus, X, ZoomIn, Move, RotateCcw } from 'lucide-react';
import { LabelData, defaultImageAdjustment } from '@/types/label';

interface InputFormProps {
  data: LabelData;
  onChange: (data: LabelData) => void;
}

export default function InputForm({ data, onChange }: InputFormProps) {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-museum-text mb-6">作品情報</h2>
      </div>

      {/* 画像アップロード（プレビューなし） */}
      <div>
        <label className="label-text">作品画像</label>
        {data.image ? (
          <div className="space-y-3">
            {/* 画像アップロード済み表示 */}
            <div className="flex items-center justify-between p-3 bg-stone-100 rounded-lg border border-stone-200">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <ImagePlus size={18} className="text-green-600" />
                <span>画像がアップロードされました</span>
              </div>
              <button
                onClick={handleRemoveImage}
                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                aria-label="画像を削除"
              >
                <X size={16} />
              </button>
            </div>

            {/* 画像調整スライダー */}
            <div className="bg-stone-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-600">
                  画像調整（プレビューで確認）
                </span>
                <button
                  onClick={handleResetAdjustment}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <RotateCcw size={12} />
                  リセット
                </button>
              </div>
              
              {/* ズーム */}
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

              {/* 横位置 */}
              <div className="flex items-center gap-2">
                <Move size={14} className="text-stone-400" />
                <span className="text-xs text-stone-500 w-12">横位置</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={data.imageAdjustment.offsetX}
                  onChange={(e) => handleAdjustmentChange('offsetX', parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                />
                <span className="text-xs text-stone-400 w-10 text-right">
                  {data.imageAdjustment.offsetX > 0 ? '+' : ''}{data.imageAdjustment.offsetX}%
                </span>
              </div>

              {/* 縦位置 */}
              <div className="flex items-center gap-2">
                <Move size={14} className="text-stone-400" />
                <span className="text-xs text-stone-500 w-12">縦位置</span>
                <input
                  type="range"
                  min="-50"
                  max="50"
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
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 
                          border-2 border-dashed border-stone-300 rounded-lg cursor-pointer
                          hover:border-museum-accent hover:bg-stone-50/50 transition-all duration-200">
            <ImagePlus className="w-8 h-8 text-stone-400 mb-2" />
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
