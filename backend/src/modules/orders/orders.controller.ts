import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '../user/entities/user.entity';

class CreateManualOrderDto {
  buyerEmail?: string;
  notes?: string;
  items: { ticketTypeId: string; eventId: string; quantity: number }[];
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @ApiOperation({ summary: 'Crear una orden de compra' })
  @ApiResponse({ status: 201, description: 'Orden creada correctamente.' })
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Crear una orden manual (admin) - efectivo/puerta' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ACCESO)
  @Post('manual')
  async createManual(@Body() dto: CreateManualOrderDto) {
    if (!dto?.items?.length) {
      throw new BadRequestException('Indica al menos un item');
    }
    return this.service.createManualOrder({
      buyerEmail: dto.buyerEmail,
      notes: dto.notes,
      items: dto.items,
    });
  }

  @ApiOperation({ summary: 'Obtener una orden por ID' })
  @ApiResponse({ status: 200, description: 'Orden encontrada.' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
