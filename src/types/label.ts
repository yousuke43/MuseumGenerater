export interface ImageAdjustment {
  scale: number;      // 1.0 = 100%
  offsetX: number;    // % offset
  offsetY: number;    // % offset
}

export interface LabelData {
  image: string | null;
  imageAdjustment: ImageAdjustment;
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
  title: '',
  description: '',
  year: '',
  author: '',
};
