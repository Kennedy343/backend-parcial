// src/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(UserRole) private userRolesRepo: Repository<UserRole>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  // CRUD de roles
  createRole(data: Partial<Role>) {
    const role = this.rolesRepo.create(data);
    return this.rolesRepo.save(role);
  }

  findAllRoles() {
    return this.rolesRepo.find();
  }

  findOneRole(id: number) {
    return this.rolesRepo.findOne({ where: { id } });
  }

  async updateRole(id: number, data: Partial<Role>) {
    await this.rolesRepo.update(id, data);
    return this.findOneRole(id);
  }

  removeRole(id: number) {
    return this.rolesRepo.delete(id);
  }

  // Asignar rol a usuario
  async assignRoleToUser(userId: number, roleId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const role = await this.rolesRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const userRole = this.userRolesRepo.create({ user, role });
    return this.userRolesRepo.save(userRole);
  }

  // Obtener roles de un usuario
  getUserRoles(userId: number) {
    return this.userRolesRepo.find({
      where: { user: { id: userId } },
      relations: ['role'],
    });
  }
}
