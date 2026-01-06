export interface LabelData {
  image: string | null;
  title: string;
  description: string;
  year: string;
  author: string;
}

export const defaultLabelData: LabelData = {
  image: null,
  title: '',
  description: '',
  year: '',
  author: '',
};
