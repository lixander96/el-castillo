import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSiteSettingsDto {
  @ApiPropertyOptional({ description: 'URL del logo para tema claro' })
  @IsOptional()
  @IsString()
  logoLightUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL del logo para tema oscuro' })
  @IsOptional()
  @IsString()
  logoDarkUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL de la imagen hero principal' })
  @IsOptional()
  @IsString()
  heroImageUrl?: string | null;

  @ApiPropertyOptional({ description: 'URL del favicon' })
  @IsOptional()
  @IsString()
  faviconUrl?: string | null;

  @ApiPropertyOptional({ description: 'Nombre del sitio' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  siteName?: string | null;

  @ApiPropertyOptional({ description: 'Bajada / tagline del sitio' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  siteTagline?: string | null;

  @ApiPropertyOptional({ description: 'Texto que aparece en el resumen de la tarjeta del comprador' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  paymentStatementDescriptor?: string;
}
