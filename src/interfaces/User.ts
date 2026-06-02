export interface User {
  id: number;
  created_at: string;
  name: string;
  needs_onboarding: boolean;
  onboarding_step: number;
}

export interface UserResponse {
  user: User;
}
