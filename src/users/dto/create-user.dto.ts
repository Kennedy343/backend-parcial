import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsArray({ message: 'roleIds debe ser un array' })
  @IsInt({ each: true, message: 'Cada roleId debe ser un número' })
  @IsOptional()
  roleIds?: number[];
}
