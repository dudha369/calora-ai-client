import type { User } from "./User";
import type { Profile } from "./Profile";
import type { Goal } from "./Goal";

export interface UserData {
  user: User;
  profile: Profile | null;
  goal: Goal | null;
  needs_onboarding: boolean;
  onboarding_step: number;
}
