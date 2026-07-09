import type { User } from './User';
import type { Profile } from './Profile';
import type { DailyGoal } from './DailyGoal';

export interface UserData {
  user: User;
  profile: Profile | null;
  goal: DailyGoal | null;
  needs_onboarding: boolean;
  onboarding_step: number;
}
