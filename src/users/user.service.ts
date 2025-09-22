// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserRole) private userRolesRepo: Repository<UserRole>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
  ) {}

  // Crear usuario con hash de contraseña y asignar roles opcionales
async create(data: Partial<User>, roleIds: number[] = []): Promise<any> {
  if (!data.password) {
    throw new Error('Password requerido');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = this.usersRepo.create({ ...data, password: hashedPassword });
  const savedUser = await this.usersRepo.save(user);

  if (roleIds.length > 0) {
    const roles = await this.rolesRepo.find({ where: { id: In(roleIds) } });
    for (const role of roles) {
      const userRole = this.userRolesRepo.create({ user: savedUser, role });
      await this.userRolesRepo.save(userRole);
    }
  }

  // Devuelve un objeto sin la propiedad password
  const { password, ...userWithoutPassword } = savedUser;
  return userWithoutPassword;
}


  // Obtener todos los usuarios con roles
  findAll() {
    return this.usersRepo.find({ relations: ['userRoles', 'userRoles.role'] });
  }

  //Obtener por email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  // Obtener un usuario por ID con roles
async findOne(id: number) {
  const user = await this.usersRepo.findOne({ where: { id } });
  if (!user) throw new NotFoundException('Usuario no encontrado');

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}


  // Actualizar usuario (puedes actualizar contraseña opcionalmente)
  async update(id: number, data: Partial<User>, roleIds?: number[]) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await this.usersRepo.update(id, data);

    // Actualizar roles si se proporcionan
    if (roleIds) {
      // Eliminar roles actuales
      await this.userRolesRepo.delete({ user: { id } });
      // Asignar roles nuevos
      const roles = await this.rolesRepo.find({ where: { id: In(roleIds) } });
      for (const role of roles) {
        const userRole = this.userRolesRepo.create({ user, role });
        await this.userRolesRepo.save(userRole);
      }
    }

    return this.findOne(id);
  }

  // Eliminar usuario
  async remove(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.userRolesRepo.delete({ user: { id } }); // eliminar relaciones
    return this.usersRepo.delete(id);
  }
}
