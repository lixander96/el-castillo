import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../user/entities/user.entity';

@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly service: SiteSettingsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Configuracion publica del sitio (logos, hero, favicon, nombre)' })
  getPublic() {
    return this.service.getPublic();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener la configuracion completa (admins)' })
  async get() {
    const settings = await this.service.getOrCreate();
    const mpStatus = await this.service.getMpStatus();
    return { settings, mpStatus };
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar la configuracion del sitio (admins)' })
  update(@Body() dto: UpdateSiteSettingsDto) {
    return this.service.update(dto);
  }

  @Get('mp/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Estado de la conexion OAuth con Mercado Pago' })
  mpStatus() {
    return this.service.getMpStatus();
  }

  @Delete('mp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Desconectar la cuenta de Mercado Pago (admins)' })
  async disconnectMp() {
    await this.service.disconnect();
    return this.service.getMpStatus();
  }
}
