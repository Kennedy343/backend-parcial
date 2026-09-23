import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/user.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;

  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const registerDto: RegisterDto = {
    email: 'test@mail.com',
    password: '123456',
  } as RegisterDto;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('crea el usuario y delega en UsersService sin exponer la password', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 1,
        email: registerDto.email,
      });

      const result = await authService.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result.message).toBe('Usuario registrado correctamente');
      expect(result.user.password).toBeUndefined();
    });

    it('rechaza un email ya registrado (BadRequest)', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: 'hash',
      });

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const hashedPassword = () => bcrypt.hash(registerDto.password, 10);

    it('emite access_token para credenciales correctas', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: await hashedPassword(),
      });
      usersService.create.mockResolvedValue({});
      jwtService.signAsync.mockResolvedValue('access-token');

      const result = await authService.login(registerDto);

      expect(result.access_token).toBe('access-token');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: registerDto.email,
      });
      expect(result.user.password).toBeUndefined();
    });

    it('rechaza una password incorrecta (Unauthorized)', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: await hashedPassword(),
      });

      await expect(
        authService.login({ ...registerDto, password: 'incorrecta' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
