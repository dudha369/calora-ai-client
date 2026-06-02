import { request } from './request';
import type { OnboardingData, OnboardingProgress } from '../interfaces/Onboarding';

export const onboarding = {
  getProgress: () =>
    request<OnboardingProgress>('onboarding/progress'),

  saveStep: (step: number, data: Partial<OnboardingData>) =>
    request('onboarding/step', 'POST', { step, ...data }),

  complete: () =>
    request('onboarding/complete', 'POST'),
};
