import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoginResDTO {
    @ApiProperty({ description: 'Identificador del usuario autenticado' })
    @Expose()
    id: number;

    @ApiProperty({ description: 'Email del usuario autenticado' })
    @Expose()
    email: string;

    @ApiProperty({ description: 'Token JWT para acceder a la API' })
    @Expose()
    access_token: string;
}
