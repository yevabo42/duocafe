import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { UserRole } from '@duocafe/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  user_metadata?: {
    role?: UserRole;
    brand_id?: string;
  };
  app_metadata?: {
    role?: UserRole;
    brand_id?: string;
  };
}

export interface AuthenticatedRequest {
  url: string;
  headers: Record<string, string>;
  user: {
    id: string;
    email: string;
    role: UserRole;
    brand_id: string | null;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización requerido');
    }

    const token = authHeader.slice(7);
    const secret = this.config.get<string>('SUPABASE_JWT_SECRET');

    if (!secret) {
      throw new UnauthorizedException('Configuración de JWT no disponible');
    }

    try {
      const payload = jwt.verify(token, secret) as JwtPayload;

      // Supabase guarda el rol del perfil en app_metadata o user_metadata
      const role =
        (payload.app_metadata?.role as UserRole) ??
        (payload.user_metadata?.role as UserRole) ??
        'consumer';

      const brand_id =
        payload.app_metadata?.brand_id ??
        payload.user_metadata?.brand_id ??
        null;

      request.user = {
        id: payload.sub,
        email: payload.email,
        role,
        brand_id,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
