import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, User } from '../user/entities/user.entity';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Get('public/:code')
  @ApiOperation({ summary: 'Consultar un cupon disponible para el checkout' })
  @ApiQuery({ name: 'eventId', required: false, type: [String], description: 'Identificadores de eventos asociados' })
  getPublicCoupon(@Param('code') code: string, @Query('eventId') eventIds?: string | string[]) {
    const normalized = Array.isArray(eventIds)
      ? eventIds
      : typeof eventIds === 'string'
      ? [eventIds]
      : [];
    return this.service.getPublicCoupon(code, normalized);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.PROMOTOR)
  @ApiOperation({ summary: 'Listar cupones disponibles' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  @ApiQuery({
    name: 'promoterId',
    required: false,
    type: Number,
    description: 'Solo administradores pueden filtrar por promotor',
  })
  async list(
    @Req() req: { user: User },
    @Query('onlyActive') onlyActive?: string,
    @Query('promoterId') promoterId?: string,
  ) {
    const options = {
      onlyActive: onlyActive === 'true' || onlyActive === '1',
      promoterId: undefined as number | null | undefined,
    };

    if (req.user.role === Role.PROMOTOR) {
      options.promoterId = req.user.id;
    } else if (promoterId) {
      const idNum = Number(promoterId);
      if (!Number.isNaN(idNum) && idNum > 0) {
        options.promoterId = idNum;
      }
    }

    return this.service.findAll(options);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo cupon' })
  @ApiResponse({ status: 201, description: 'Cupon creado correctamente.' })
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  @Get('metrics/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.PROMOTOR)
  @ApiOperation({ summary: 'Resumen de metricas para el promotor autenticado' })
  myMetrics(@Req() req: { user: User }) {
    return this.service.getPromoterDashboard(req.user.id);
  }

  @Get('metrics/promoter/:promoterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Resumen de metricas para un promotor especifico (solo admins)' })
  promoterMetrics(@Param('promoterId') promoterId: string) {
    const idNum = Number(promoterId);
    if (Number.isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('Identificador de promotor invalido');
    }
    return this.service.getPromoterDashboard(idNum);
  }

  @Get(':id/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.PROMOTOR)
  @ApiOperation({ summary: 'Ver metricas de un cupon puntual' })
  async metrics(@Req() req: { user: User }, @Param('id') id: string) {
    const result = await this.service.getCouponMetrics(id);
    if (!(req.user.role === Role.PROMOTOR && result.coupon.promoter?.id === req.user.id) && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('No posee acceso a este cupon');
    }
    return result;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.PROMOTOR)
  @ApiOperation({ summary: 'Obtener los datos de un cupon' })
  async get(@Req() req: { user: User }, @Param('id') id: string) {
    const coupon = await this.service.findById(id);
    if (req.user.role === Role.PROMOTOR && coupon.promoter?.id !== req.user.id) {
      throw new ForbiddenException('No posee acceso a este cupon');
    }
    return coupon;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un cupon existente' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un cupon' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('admin/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar eventos disponibles para asignar a cupones (solo admins)' })
  getEventOptions() {
    return this.service.getEventOptions();
  }
}
