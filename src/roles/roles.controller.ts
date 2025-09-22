// src/roles/roles.controller.ts
import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Crear rol con validación
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  // Obtener todos los roles
  @Get()
  findAll() {
    return this.rolesService.findAllRoles();
  }

  // Obtener rol por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOneRole(+id);
  }

  // Eliminar rol
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.removeRole(+id);
  }
}
