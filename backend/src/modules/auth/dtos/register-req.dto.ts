import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../user/entities/user.entity';

export class RegisterReqDTO {
  @ApiProperty({ description: 'Correo electrónico del nuevo usuario' })
  @IsEmail()
  @MaxLength(64)
  email: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  @MaxLength(64)
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  @MaxLength(64)
  lastName: string;

  @ApiProperty({ description: 'Contraseña para iniciar sesión', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
