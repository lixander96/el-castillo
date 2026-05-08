import { Controller, Get, Param, Post, UseGuards, Res, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { UserAuth } from '../auth/decorators/user-auth.decorator';
import { Role, User } from '../user/entities/user.entity';
import { Response } from 'express';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener los tickets del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Listado de tickets del usuario autenticado.' })
  @Get('me')
  async findMine(@UserAuth() user: User) {
    const tickets = await this.service.findForUser(user);
    return tickets.map((ticket) => {
      const event = ticket.orderItem?.event;
      const ticketType = ticket.orderItem?.ticketType;

      return {
        id: ticket.id,
        eventId: event?.id ?? null,
        eventTitle: event?.title ?? null,
        eventDate: event?.date ?? null,
        eventTime: event?.time ?? null,
        venue: event?.space ?? null,
        ticketTypeId: ticketType?.id ?? null,
        ticketTypeName: ticketType?.name ?? null,
        price: ticketType ? Number(ticketType.price) : null,
        purchaseDate: ticket.createdAt,
        qrCode: ticket.code,
        status: ticket.redeemedAt ? 'used' : 'confirmed',
        redeemedAt: ticket.redeemedAt,
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar el ticket en PDF' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF del ticket generado.' })
  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @UserAuth() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, filename } = await this.service.getTicketPdfForUser(id, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  // Validar ticket (publico o con guard, como prefieras)
  @ApiOperation({ summary: 'Validar un ticket mediante su codigo' })
  @ApiResponse({ status: 200, description: 'Resultado de la validacion del ticket.' })
  @Get('validate/:code')
  async validate(@Param('code') code: string) {
    const t = await this.service.getByCode(code);
    return {
      valid: !t.redeemedAt,
      event: t.orderItem.event.title,
      ticketType: t.orderItem.ticketType.name,
      redeemedAt: t.redeemedAt,
    };
  }

  // Redimir ticket (solo staff/admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ACCESO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redimir un ticket (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Ticket redimido correctamente.' })
  @Post('redeem/:code')
  async redeem(@Param('code') code: string) {
    const t = await this.service.redeem(code);
    return { ok: true, redeemedAt: t.redeemedAt };
  }


  // NUEVO: validar ticket para un evento específico (acceso/admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ACCESO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar ticket scopeado a un evento (acceso/admin)' })
  @ApiResponse({ status: 200, description: 'Resultado de la validación.' })
  @Get('event/:eventId/validate/:code')
  async validateForEvent(@Param('eventId') eventId: string, @Param('code') code: string) {
    return this.service.validateForEvent(eventId, code);
  }

  // NUEVO: redimir ticket para un evento específico (acceso/admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ACCESO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redimir ticket para un evento (acceso/admin)' })
  @ApiResponse({ status: 200, description: 'Ticket redimido.' })
  @Post('event/:eventId/redeem/:code')
  async redeemForEvent(
    @Param('eventId') eventId: string,
    @Param('code') code: string,
    @UserAuth() user: User,
  ) {
    const t = await this.service.redeemForEvent(eventId, code, user);
    return { ok: true, redeemedAt: t.redeemedAt };
  }
}
