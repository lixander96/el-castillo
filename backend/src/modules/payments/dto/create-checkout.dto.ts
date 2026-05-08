import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, Min } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'ID interno de la orden generada en la base de datos' })
  @IsString()
  orderId: string;      // ID interno que generes en tu DB

  @ApiProperty({ description: 'Título del item a pagar', example: 'Entrada General' })
  @IsString()
  title: string;        // "Entrada General"

  @ApiProperty({ description: 'Cantidad de unidades a cobrar', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Precio unitario', minimum: 0 })
  @IsNumber()
  @Min(0)
  unit_price: number;
  // opcional: payerEmail?: string;
}
