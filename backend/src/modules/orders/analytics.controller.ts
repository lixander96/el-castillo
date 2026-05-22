import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../user/entities/user.entity';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OPERACIONES)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'KPIs principales (recaudacion, tickets, ocupacion)' })
  overview(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.service.getOverview({ from, to, eventId });
  }

  @Get('daily-sales')
  @ApiOperation({ summary: 'Ventas agrupadas por dia' })
  dailySales(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.service.getDailySales({ from, to, eventId });
  }

  @Get('promoters')
  @ApiOperation({ summary: 'Rendimiento por promotor / cupon' })
  promoters(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.service.getPromoterBreakdown({ from, to, eventId });
  }

  @Get('events')
  @ApiOperation({ summary: 'Eventos para el filtro' })
  events() {
    return this.service.getEventOptions();
  }
}
