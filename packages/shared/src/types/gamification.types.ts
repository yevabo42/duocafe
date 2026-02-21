// ============================================
// NIVELES
// ============================================

export interface Level {
  level: number;
  name: string;
  granos_required: number;
  granos_next: number | null;
}

// ============================================
// RACHAS
// ============================================

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  shield_active: boolean;
  shields_used_this_week: number;
  milestone_7_claimed: boolean;
  milestone_30_claimed: boolean;
  milestone_60_claimed: boolean;
  milestone_100_claimed: boolean;
}

// ============================================
// CORAZONES
// ============================================

export interface UserHearts {
  user_id: string;
  hearts_remaining: number;
  max_hearts: number;
  next_regen_at: string | null;
}

// ============================================
// ACTIVIDAD
// ============================================

export type ActivityType =
  | 'lesson_completed'
  | 'quiz_completed'
  | 'challenge_completed'
  | 'purchase_registered'
  | 'producer_visited'
  | 'reward_redeemed'
  | 'referral_sent'
  | 'badge_earned'
  | 'streak_shield_used';

export interface ActivityReward {
  granos: number;
  cerezas: number;
}

// Recompensas por tipo de actividad (fuente unica de verdad)
export const ACTIVITY_REWARDS: Record<ActivityType, ActivityReward> = {
  lesson_completed: { granos: 10, cerezas: 5 },
  quiz_completed: { granos: 25, cerezas: 15 },
  challenge_completed: { granos: 15, cerezas: 10 },
  purchase_registered: { granos: 30, cerezas: 20 },
  producer_visited: { granos: 5, cerezas: 0 },
  reward_redeemed: { granos: 0, cerezas: 0 },
  referral_sent: { granos: 0, cerezas: 50 },
  badge_earned: { granos: 0, cerezas: 0 }, // varía por badge
  streak_shield_used: { granos: 0, cerezas: 0 },
};
