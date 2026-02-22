import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  HEART_REFILL_COST_CEREZAS,
  MAX_HEARTS,
  HEART_REGEN_MINUTES,
  HeartsState,
} from '@duocafe/shared';

@Injectable()
export class HeartsService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async getHearts(userId: string): Promise<HeartsState> {
    const { data, error } = await this.supabase
      .from('user_hearts')
      .select('hearts_remaining, next_regen_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Registro de corazones no encontrado');

    return {
      hearts_remaining: data.hearts_remaining as number,
      next_regen_at: data.next_regen_at as string | null,
    };
  }

  async spendHeart(userId: string): Promise<HeartsState> {
    const { data: hearts, error } = await this.supabase
      .from('user_hearts')
      .select('hearts_remaining')
      .eq('user_id', userId)
      .single();

    if (error || !hearts) throw new NotFoundException('Registro de corazones no encontrado');

    const current = hearts.hearts_remaining as number;
    if (current <= 0) {
      throw new BadRequestException('No tienes corazones disponibles');
    }

    const newRemaining = current - 1;
    const now = new Date();
    const nextRegen =
      newRemaining < MAX_HEARTS
        ? new Date(now.getTime() + HEART_REGEN_MINUTES * 60 * 1000).toISOString()
        : null;

    const { data: updated, error: updateError } = await this.supabase
      .from('user_hearts')
      .update({
        hearts_remaining: newRemaining,
        next_regen_at: nextRegen,
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .select('hearts_remaining, next_regen_at')
      .single();

    if (updateError || !updated) throw new BadRequestException(updateError?.message);

    return {
      hearts_remaining: updated.hearts_remaining as number,
      next_regen_at: updated.next_regen_at as string | null,
    };
  }

  async refillHeart(userId: string): Promise<HeartsState> {
    // 1. Verificar cerezas suficientes
    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('cerezas_balance, cerezas_spent_total')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const cerezasBalance = profile.cerezas_balance as number;
    if (cerezasBalance < HEART_REFILL_COST_CEREZAS) {
      throw new BadRequestException(
        `Necesitas ${HEART_REFILL_COST_CEREZAS} cerezas para recuperar un corazón`,
      );
    }

    // 2. Verificar estado de corazones
    const { data: hearts, error: heartsError } = await this.supabase
      .from('user_hearts')
      .select('hearts_remaining')
      .eq('user_id', userId)
      .single();

    if (heartsError || !hearts) {
      throw new NotFoundException('Registro de corazones no encontrado');
    }

    const current = hearts.hearts_remaining as number;
    if (current >= MAX_HEARTS) {
      throw new BadRequestException('Ya tienes los corazones completos');
    }

    // 3. Gastar cerezas
    const { error: spendError } = await this.supabase
      .from('user_profiles')
      .update({
        cerezas_balance: cerezasBalance - HEART_REFILL_COST_CEREZAS,
        cerezas_spent_total: (profile.cerezas_spent_total as number) + HEART_REFILL_COST_CEREZAS,
      })
      .eq('id', userId);

    if (spendError) throw new BadRequestException(spendError.message);

    // 4. Agregar corazón
    const newRemaining = current + 1;
    const now = new Date();
    const nextRegen =
      newRemaining < MAX_HEARTS
        ? new Date(now.getTime() + HEART_REGEN_MINUTES * 60 * 1000).toISOString()
        : null;

    const { data: updated, error: updateError } = await this.supabase
      .from('user_hearts')
      .update({
        hearts_remaining: newRemaining,
        next_regen_at: nextRegen,
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .select('hearts_remaining, next_regen_at')
      .single();

    if (updateError || !updated) throw new BadRequestException(updateError?.message);

    return {
      hearts_remaining: updated.hearts_remaining as number,
      next_regen_at: updated.next_regen_at as string | null,
    };
  }
}
