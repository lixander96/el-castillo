import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';

class OrderItemDto {
  @ApiProperty({ description: 'Identificador del tipo de ticket seleccionado', format: 'uuid' })
  @IsUUID()
  ticketTypeId: string;

  @ApiProperty({ description: 'Identificador del evento asociado', format: 'uuid' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ description: 'Cantidad de tickets solicitados', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Email del comprador para enviar la confirmación' })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  @ApiPropertyOptional({ description: 'Código de cupón a aplicar' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ description: 'Lista de items solicitados', type: [OrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsArray()
  items: OrderItemDto[];
}
