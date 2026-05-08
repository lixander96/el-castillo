import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Codigo unico del cupon (se guarda en mayusculas)',
    example: 'PROMO10',
    maxLength: 48,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Descripcion interna del cupon',
    example: 'Cupon 10% para lanzamiento',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tipo de descuento que aplica el cupon',
    enum: CouponType,
    default: CouponType.AMOUNT,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiPropertyOptional({
    description:
      'Valor del descuento. En tipo AMOUNT se interpreta como monto en ARS, en PERCENTAGE como porcentaje (0-100)',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @ValidateIf((input: CreateCouponDto) => input.type !== CouponType.FREE)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ValidateIf((input: CreateCouponDto) => input.type === CouponType.PERCENTAGE)
  @Max(100)
  value?: number;

  @ApiPropertyOptional({
    description:
      'Porcentaje de comision para el promotor asociado (0-100). Solo aplica si el cupon tiene promotor.',
    example: 15,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiPropertyOptional({
    description: 'Limite total de tickets que se pueden vender con este cupon',
    example: 150,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @IsPositive()
  maxRedemptions?: number;

  @ApiPropertyOptional({
    description: 'Identificador del promotor al que se le atribuiran las ventas (rol PROMOTOR)',
    example: 23,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @IsPositive()
  promoterId?: number;

  @ApiPropertyOptional({
    description: 'Indica si el cupon se encuentra activo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Identificadores de eventos donde se puede aplicar el cupon',
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  eventIds?: string[];
}
