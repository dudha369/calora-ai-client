import { request } from './request';

export interface ProductSubmitIn {
  barcode: string;
  product_name: string;
  brand?: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
}

export const openFoodFactsApi = {
  status: () => request<{ available: boolean }>('openfoodfacts/status'),
  submit: (data: ProductSubmitIn) =>
    request<{ ok: boolean }>('openfoodfacts/submit', 'POST', data),
};
