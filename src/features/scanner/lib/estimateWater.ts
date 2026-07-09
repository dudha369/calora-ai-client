import type { ProductData } from '../types/productData';

/**
 * Heuristically detects whether an OpenFoodFacts product is a liquid
 * by inspecting `packageQuantityStr` and `servingSizeStr` for volume units.
 *
 * Returns the estimated water content in ml for the given portion,
 * or 0 if the product appears to be solid food.
 *
 * Default water fraction for beverages: ~89% (average for sodas, juices).
 * This is intentionally conservative — the user can adjust the value
 * in the BarcodeResultModal before confirming.
 */

const LIQUID_PATTERN = /\d\s*(ml|мл|cl|л|l|fl\.?\s*oz)\b/i;
const DEFAULT_WATER_FRACTION = 0.89;

function looksLiquid(product: ProductData): boolean {
  const fields = [
    product.packageQuantityStr,
    product.servingSizeStr,
  ];

  return fields.some((s) => s != null && LIQUID_PATTERN.test(s));
}

/**
 * Estimate water_ml for a barcode product at a given portion size (grams).
 *
 * For liquids, 1g ≈ 1ml (density ≈ 1 for water-based drinks),
 * so we treat portionG as the equivalent volume in ml.
 */
export function estimateWaterMl(
  product: ProductData,
  portionG: number,
): number {
  if (!looksLiquid(product)) return 0;
  return Math.round(portionG * DEFAULT_WATER_FRACTION);
}
