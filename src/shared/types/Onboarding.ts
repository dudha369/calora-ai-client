export type Gender = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
export type WaterTrack = 'auto' | 'manual' | 'none';
export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lbs';

export interface OnboardingData {
  gender?: Gender;
  birth_date?: string; // YYYY-MM-DD
  height?: number;
  height_unit?: HeightUnit;
  weight?: number;
  weight_unit?: WeightUnit;
  goal?: Goal;
  target_weight?: number;
  activity_level?: ActivityLevel;
  dietary_restrictions?: string[];
  allergy_note?: string;
  water_track?: WaterTrack;
  water_goal?: number;
  medical_conditions?: string[];
  timezone?: string;
}

export interface OnboardingProgress {
  step: number;
  data: Partial<OnboardingData>;
}
