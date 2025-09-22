import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'El nombre del rol debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  name: string;
}
