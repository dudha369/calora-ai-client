import axios from 'axios';

function extractErrorDetail(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail;
  }
  if (err && typeof err === 'object' && 'detail' in err) {
    return (err as { detail?: string }).detail;
  }
  return undefined;
}

export function isNoFoodDetected(err: unknown): boolean {
  return extractErrorDetail(err) === 'no_food_detected';
}

export function isAiQuotaExceeded(err: unknown): boolean {
  return extractErrorDetail(err) === 'ai_quota_exceeded';
}

export function resolveAiErrorMessage(err: unknown): string {
  if (isAiQuotaExceeded(err)) {
    return 'Дневной лимит AI-запросов исчерпан. Попробуй позже — лимит сбрасывается раз в сутки.';
  }
  if (isNoFoodDetected(err)) {
    return 'На фотографии не найдена еда. Убедитесь, что продукт в кадре, и попробуйте ещё раз.';
  }
  if (err instanceof Error) return err.message;
  return 'Не удалось проанализировать фото. Попробуй ещё раз.';
}
