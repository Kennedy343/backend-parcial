// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 🚀 Registrar nuevo usuario
  async register(dto: RegisterDto) {
    // Verificar si ya existe un usuario con ese email
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Hash de la contraseña (⚠️ siempre 2 argumentos: valor y saltRounds)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario con UsersService (reutiliza tu lógica de repositorio)
    const user = await this.usersService.create(
      { ...dto, password: hashedPassword },
      dto.roleIds ?? [],
    );

    return {
      message: 'Usuario registrado correctamente',
      user,
    };
  }

  // 🚀 Login de usuario
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Payload para el JWT
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
