import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';
import { WhatsappButtonDto } from './whatsapp-button.dto';

export class SendMenuMessageDto {
  @ApiProperty({ description: 'Numero de WhatsApp del destinatario (solo digitos)', example: '5491122334455' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'El numero debe contener solo digitos' })
  to: string;

  @ApiProperty({ description: 'Mensaje que acompana al menu interactivo' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Botones interactivos disponibles', type: [WhatsappButtonDto], minItems: 1, maxItems: 3 })
  @ValidateNested({ each: true })
  @Type(() => WhatsappButtonDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  buttons: WhatsappButtonDto[];
}
