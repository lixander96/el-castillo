import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendImageMessageDto {
  @ApiProperty({ description: 'Numero de WhatsApp del destinatario (solo digitos)', example: '5491122334455' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'El numero debe contener solo digitos' })
  to: string;

  @ApiProperty({ description: 'Nombre del archivo de imagen con extension', example: 'flyer-evento.png' })
  @IsString()
  @IsNotEmpty()
  imageName: string; // nombre del archivo con extension, ej: "foto123.png"

  @ApiPropertyOptional({ description: 'Texto opcional que acompana a la imagen' })
  @IsString()
  caption?: string;
}

