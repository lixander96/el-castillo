import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SendTestMessageDTO {
    @IsEmail({}, {each: true})
    @ApiProperty()
    destination: string[]

    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: 'Este es un mensaje de prueba enviado desde el sistema de defensa civil de la municipal de Moreno, Buenos Aires.'})
    message: string
}