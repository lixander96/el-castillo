import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendTextMessageDto {
  @ApiProperty({ description: 'Numero de WhatsApp del destinatario (solo digitos)', example: '5491122334455' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'El numero debe contener solo digitos' })
  to: string;

  @ApiProperty({ description: 'Mensaje de texto a enviar' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

