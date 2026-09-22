import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type PublicUser = Omit<User, 'password'>;

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRolesRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    if (!dto.password) {
      throw new BadRequestException('La contraseña es requerida');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.save(
        manager.create(User, { ...dto, password: hashedPassword }),
      );

      const roleIds = dto.roleIds ?? [];
      if (roleIds.length > 0) {
        const roles = await manager.find(Role, { where: { id: In(roleIds) } });
        await manager.save(
          manager.create(
            UserRole,
            roles.map((role) => ({ user, role })),
          ),
        );
      }

      return this.sanitize(user);
    });
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersRepo.find({
      relations: ['userRoles', 'userRoles.role'],
    });
    return users.map((user) => this.sanitize(user));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<PublicUser> {
    return this.sanitize(await this.findEntity(id));
  }

  async update(id: number, dto: UpdateUserDto): Promise<PublicUser> {
    await this.findEntity(id);

    return this.dataSource.transaction(async (manager) => {
      const patch: Partial<User> = {};
      if (dto.email) patch.email = dto.email;
      if (dto.password) {
        patch.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
      }
      await manager.update(User, { id }, patch);

      const roleIds = dto.roleIds;
      if (roleIds !== undefined) {
        await manager.delete(UserRole, { user: { id } });
        if (roleIds.length > 0) {
          const roles = await manager.find(Role, {
            where: { id: In(roleIds) },
          });
          await manager.save(
            manager.create(
              UserRole,
              roles.map((role) => ({ user: { id }, role })),
            ),
          );
        }
      }

      const updated = await manager.findOne(User, { where: { id } });
      if (!updated) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return this.sanitize(updated);
    });
  }

  async remove(id: number): Promise<void> {
    await this.findEntity(id);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(UserRole, { user: { id } });
      await manager.delete(User, { id });
    });
  }

  private async findEntity(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  private sanitize(user: User): PublicUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
