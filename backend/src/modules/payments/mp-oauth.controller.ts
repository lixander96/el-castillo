import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, User } from '../user/entities/user.entity';
import { EnvironmentVariables } from '../../config/config.configuration';

interface OAuthStateClaims {
  adminId: number;
  purpose: 'mp_oauth';
}

@ApiTags('payments')
@Controller('payments/mp/oauth')
export class MpOAuthController {
  constructor(
    private readonly settings: SiteSettingsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables>,
  ) {}

  @Get('start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Iniciar el flujo OAuth con Mercado Pago (admins)' })
  async start(@Req() req: { user: User }) {
    const state = await this.jwt.signAsync(
      { adminId: req.user.id, purpose: 'mp_oauth' } as OAuthStateClaims,
      { expiresIn: '15m' },
    );
    const url = await this.settings.buildAuthorizationUrl(state);
    return { url };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback de Mercado Pago tras autorizar la app' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    const frontendBase = this.config.get('FRONTEND_URL') || '';
    const target = (status: 'success' | 'error', detail?: string) => {
      const url = new URL(`${frontendBase}/configuracion`);
      url.searchParams.set('mp', status);
      if (detail) url.searchParams.set('mp_detail', detail);
      return res.redirect(url.toString());
    };

    if (error) {
      return target('error', errorDescription || error);
    }
    if (!code || !state) {
      return target('error', 'missing_code_or_state');
    }

    try {
      const payload = await this.jwt.verifyAsync<OAuthStateClaims>(state);
      if (payload.purpose !== 'mp_oauth') {
        throw new BadRequestException('state purpose invalido');
      }
    } catch (err: any) {
      return target('error', 'invalid_state');
    }

    try {
      await this.settings.exchangeCode(code);
    } catch (err: any) {
      const detail = err?.message || 'exchange_failed';
      return target('error', detail.slice(0, 200));
    }

    return target('success');
  }
}
