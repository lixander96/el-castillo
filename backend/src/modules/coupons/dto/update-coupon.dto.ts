import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsPositive, IsUUID, ValidateIf } from 'class-validator';
import { CreateCouponDto } from './create-coupon.dto';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  @ApiPropertyOptional({
    description: 'Permite desvincular el promotor del cupon cuando se envia en true',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  clearPromoter?: boolean;

  @ApiPropertyOptional({
    description: 'Elimina el limite de ventas configurado cuando se envia en true',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  clearLimit?: boolean;

  @ApiPropertyOptional({
    description: 'Identificadores de eventos permitidos para este cupon',
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  eventIds?: string[];

  @ApiPropertyOptional({
    description: 'Elimina las restricciones de eventos cuando se envia en true',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  clearEvents?: boolean;

  @ApiPropertyOptional({
    description: 'Identificador del promotor a asociar (rol ADMIN o PROMOTOR). Se ignora si clearPromoter es true.',
    example: 42,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? null : value !== undefined ? Number(value) : value,
  )
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsInt()
  @IsPositive()
  promoterId?: number | null;
}
