import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    try {
      return await this.rolesRepo.save(this.rolesRepo.create(dto));
    } catch (error) {
      this.assertUniqueName(error);
      throw error;
    }
  }

  findAll(): Promise<Role[]> {
    return this.rolesRepo.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    return role;
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    try {
      Object.assign(role, dto);
      return await this.rolesRepo.save(role);
    } catch (error) {
      this.assertUniqueName(error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.rolesRepo.delete(id);
  }

  private assertUniqueName(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: string }).code === '23505'
    ) {
      throw new ConflictException('Ya existe un rol con ese nombre');
    }
  }
}
