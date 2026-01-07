export interface ImageAdjustment {
  scale: number;      // 1.0 = 100%
  offsetX: number;    // % offset
  offsetY: number;    // % offset
}

export type ImageFilter = 'none' | 'sepia' | 'vintage' | 'aged' | 'faded';

export interface LabelData {
  image: string | null;
  imageAdjustment: ImageAdjustment;
  imageFilter: ImageFilter;
  title: string;
  description: string;
  year: string;
  author: string;
}

export const defaultImageAdjustment: ImageAdjustment = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export const defaultLabelData: LabelData = {
  image: null,
  imageAdjustment: defaultImageAdjustment,
  imageFilter: 'none',
  title: '',
  description: '',
  year: '',
  author: '',
};

// フィルター定義
export const imageFilters: { id: ImageFilter; name: string; css: string }[] = [
  { id: 'none', name: 'オリジナル', css: 'none' },
  { id: 'sepia', name: 'セピア', css: 'sepia(0.8)' },
  { id: 'vintage', name: 'ヴィンテージ', css: 'sepia(0.4) contrast(1.1) brightness(0.9) saturate(0.8)' },
  { id: 'aged', name: '古びた写真', css: 'sepia(0.6) contrast(0.9) brightness(0.85) saturate(0.7)' },
  { id: 'faded', name: '色褪せ', css: 'grayscale(0.3) contrast(0.95) brightness(1.05) saturate(0.6)' },
];
