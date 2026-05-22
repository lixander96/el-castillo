import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { EventStatusEnum } from '../entities/event-status.entity';

class CreateTicketTypeDto {
  @IsOptional()
  @IsString()
  id: string

  @ApiProperty({ description: 'Nombre de la categoría de ticket', minLength: 1, maxLength: 64 })
  @IsString()
  @Length(1, 64)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción breve del tipo de ticket' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio del ticket', example: 10000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Cantidad total de tickets disponibles para este tipo' })
  @IsInt()
  total: number;

  @ApiPropertyOptional({ description: 'Tickets ya vendidos para este tipo (solo lectura, calculado)' })
  @IsInt()
  @IsOptional()
  sold?: number;

  @ApiPropertyOptional({ description: 'Tickets vendidos manualmente (efectivo / puerta)' })
  @IsInt()
  @IsOptional()
  manualSold?: number;

  @ApiPropertyOptional({ description: 'Tickets disponibles restantes para este tipo' })
  @IsInt()
  @IsOptional()
  available?: number;

  @ApiPropertyOptional({ description: 'Beneficios o perks asociados al ticket', type: [String] })
  @IsOptional()
  @IsArray()
  perks?: string[];
}

export class CreateEventDto {
  @ApiProperty({ description: 'Título del evento', minLength: 1, maxLength: 160 })
  @IsString()
  @Length(1, 160)
  title: string;

  @ApiProperty({ description: 'Descripción completa del evento' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Fecha del evento (YYYY-MM-DD)', example: '2024-12-31' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Hora del evento (HH:mm)', example: '21:00' })
  @IsString()
  time: string;

  @ApiProperty({ description: 'Espacio o salón donde se realiza el evento' })
  @IsString()
  space: string;

  @ApiProperty({ description: 'Capacidad total del evento' })
  @IsInt()
  capacity: number;

  @ApiProperty({ description: 'Precio base del evento', example: 15000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Estado actual del evento', enum: EventStatusEnum })
  @IsEnum(EventStatusEnum)
  status: EventStatusEnum;

  @ApiProperty({ description: 'Categoría del evento', example: 'Música' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'URL de imagen destacada del evento' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Marca si el evento se destaca en la agenda' })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ description: 'Tipos de ticket disponibles', type: [CreateTicketTypeDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTypeDto)
  @IsArray()
  ticketTypes: CreateTicketTypeDto[];
}
