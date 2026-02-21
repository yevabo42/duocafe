export interface LeagueTier {
  tier: number;
  name: string;
  maxUsers: number;
  promotionSpots: number;
  demotionSpots: number;
  weeklyRewardGranos: number;
  weeklyRewardCerezas: number;
}

export const LEAGUE_TIERS: LeagueTier[] = [
  { tier: 1, name: 'Semilla',       maxUsers: 30, promotionSpots: 10, demotionSpots: 0,  weeklyRewardGranos: 50,  weeklyRewardCerezas: 25 },
  { tier: 2, name: 'Grano Verde',   maxUsers: 30, promotionSpots: 10, demotionSpots: 5,  weeklyRewardGranos: 100, weeklyRewardCerezas: 50 },
  { tier: 3, name: 'Pergamino',     maxUsers: 25, promotionSpots: 8,  demotionSpots: 5,  weeklyRewardGranos: 150, weeklyRewardCerezas: 75 },
  { tier: 4, name: 'Tostado',       maxUsers: 20, promotionSpots: 6,  demotionSpots: 4,  weeklyRewardGranos: 200, weeklyRewardCerezas: 100 },
  { tier: 5, name: 'Espresso',      maxUsers: 15, promotionSpots: 5,  demotionSpots: 3,  weeklyRewardGranos: 300, weeklyRewardCerezas: 150 },
  { tier: 6, name: 'Origen Dorado', maxUsers: 10, promotionSpots: 0,  demotionSpots: 3,  weeklyRewardGranos: 500, weeklyRewardCerezas: 250 },
];
