import { withOpacity } from '@/shared/lib/colors';
import { MARKER_FOOD_COLOR, MARKER_WATER_COLOR } from '@/shared/constants/markers';

/**
 * Determines the activity-marker background for a date cell.
 * Used by both DateStripItem and MonthGrid to avoid duplication.
 */
export function getMarkerBackground(
  hasFood: boolean,
  hasWater: boolean,
  isDisabled: boolean,
  textColor: string,
  hintColor: string,
): string {
  if (hasFood && hasWater) {
    return `linear-gradient(90deg, ${MARKER_FOOD_COLOR} 50%, ${MARKER_WATER_COLOR} 50%)`;
  }
  if (hasFood) return MARKER_FOOD_COLOR;
  if (hasWater) return MARKER_WATER_COLOR;
  if (isDisabled) return withOpacity(textColor, 0.25);
  return hintColor;
}
