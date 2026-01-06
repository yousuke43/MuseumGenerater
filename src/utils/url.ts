import { LabelData, defaultLabelData } from '@/types/label';

export function encodeDataToUrl(data: LabelData): string {
  try {
    // 画像は大きすぎるのでURLには含めない（画像なしバージョン）
    const dataWithoutImage = { ...data, image: null };
    const jsonStr = JSON.stringify(dataWithoutImage);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return base64;
  } catch (error) {
    console.error('Failed to encode data:', error);
    return '';
  }
}

export function decodeDataFromUrl(encoded: string): LabelData | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(jsonStr) as LabelData;
    return {
      ...defaultLabelData,
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to decode data:', error);
    return null;
  }
}

export function getShareableUrl(data: LabelData): string {
  if (typeof window === 'undefined') return '';
  const encoded = encodeDataToUrl(data);
  const url = new URL(window.location.href);
  url.searchParams.set('data', encoded);
  return url.toString();
}

export function getDataFromUrlParams(): LabelData | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('data');
  if (encoded) {
    return decodeDataFromUrl(encoded);
  }
  return null;
}
