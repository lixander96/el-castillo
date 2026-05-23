import { Body, Controller, Delete, Get, Header, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '../user/entities/user.entity';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos los eventos disponibles' })
  @ApiResponse({ status: 200, description: 'Listado de eventos devuelto correctamente.' })
  list() {
    return this.service.findAll();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener un evento por su slug' })
  getBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get('og/:slug')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({ summary: 'Open Graph HTML para previsualizaciones de redes sociales' })
  async ogPreview(@Param('slug') slug: string, @Res() res: Response) {
    try {
      res.send(await this.service.buildOgHtml(slug));
    } catch (err) {
      const fallbackUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '') || '/';
      res.send(
        `<!doctype html><meta http-equiv="refresh" content="0; url=${fallbackUrl}"><a href="${fallbackUrl}">Ir a la agenda</a>`,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento por su identificador' })
  @ApiResponse({ status: 200, description: 'Evento encontrado.' })
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo evento (solo administradores)' })
  @ApiResponse({ status: 201, description: 'Evento creado correctamente.' })
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un evento existente (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Evento actualizado correctamente.' })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un evento (solo administradores)' })
  @ApiResponse({ status: 200, description: 'Evento eliminado correctamente.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
