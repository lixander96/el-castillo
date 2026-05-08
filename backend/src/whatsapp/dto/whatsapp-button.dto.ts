import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WhatsappButtonDto {
  @ApiProperty({ description: 'Identificador interno del boton' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Texto que se mostrara en el boton' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

