'use client';

import React, { useCallback } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { LabelData } from '@/types/label';

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
        onChange({ ...data, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, [data, onChange]);

  const handleRemoveImage = useCallback(() => {
    onChange({ ...data, image: null });
  }, [data, onChange]);

  const handleFieldChange = useCallback((field: keyof LabelData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({ ...data, [field]: e.target.value });
  }, [data, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-museum-text mb-6">作品情報</h2>
      </div>

      {/* 画像アップロード */}
      <div>
        <label className="label-text">作品画像</label>
        {data.image ? (
          <div className="relative group">
            <img
              src={data.image}
              alt="作品プレビュー"
              className="w-full h-48 object-cover rounded-lg border border-stone-200"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       hover:bg-red-50 hover:text-red-600"
              aria-label="画像を削除"
            >
              <X size={16} />
            </button>
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
