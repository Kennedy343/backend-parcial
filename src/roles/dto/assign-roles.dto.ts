// src/users/dto/assign-roles.dto.ts
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class AssignRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true }) // cada elemento debe ser número
  roleIds: number[];
}
