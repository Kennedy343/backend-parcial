// src/users/users.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRolesDto } from '../roles/dto/assign-roles.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Crear usuario con roles opcionales
  @Post()
  create(@Body() dto: CreateUserDto) {
    const { email, password, roleIds = [] } = dto;
    return this.usersService.create({ email, password }, roleIds);
  }

  // Obtener todos los usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Obtener un usuario por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // Actualizar usuario (email, password opcional) y/o roles
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { email?: string; password?: string; roleIds?: number[] },
  ) {
    const { email, password, roleIds } = body;
    return this.usersService.update(+id, { email, password }, roleIds);
  }

  // Eliminar usuario
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // Asignar roles a un usuario existente
  @Post(':id/roles')
  assignRoles(@Param('id') userId: string, @Body() dto: AssignRolesDto) {
    return this.usersService.update(+userId, {}, dto.roleIds);
  }
}
