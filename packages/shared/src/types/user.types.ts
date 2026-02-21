export type UserRole = 'consumer' | 'brand_admin' | 'platform_admin' | 'producer';

export type DailyGoal = 'casual' | 'regular' | 'intenso';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  brand_id: string | null;
  level: number;
  level_title: string;
  total_granos: number;
  cerezas_balance: number;
  cerezas_earned_total: number;
  cerezas_spent_total: number;
  referral_code: string;
  referred_by: string | null;
  daily_goal: DailyGoal;
  onboarding_completed: boolean;
  push_enabled: boolean;
  streak_reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  brand_id: string | null;
  display_name: string;
  level: number;
  cerezas_balance: number;
}

export interface PublicProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  level_title: string;
  total_granos: number;
}
