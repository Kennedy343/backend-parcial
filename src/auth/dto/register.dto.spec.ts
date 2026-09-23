import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  const validDto = {
    email: 'test@mail.com',
    password: '123456',
  };

  const buildDto = (overrides: Partial<RegisterDto>) =>
    Object.assign(new RegisterDto(), validDto, overrides);

  it('acepta un DTO válido (email y password correctos, sin roleIds)', async () => {
    const dto = buildDto({});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('acepta roleIds como array de enteros', async () => {
    const dto = buildDto({ roleIds: [1, 2] });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rechaza un email con formato inválido', async () => {
    const dto = buildDto({ email: 'test' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rechaza un email vacío', async () => {
    const dto = buildDto({ email: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rechaza una password vacía', async () => {
    const dto = buildDto({ password: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rechaza una password que no es texto', async () => {
    const dto = buildDto({ password: 123 } as Partial<RegisterDto>);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rechaza roleIds que no son un array', async () => {
    const dto = buildDto({ roleIds: 5 } as Partial<RegisterDto>);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'roleIds')).toBe(true);
  });

  it('rechaza roleIds con elementos no enteros', async () => {
    const dto = buildDto({ roleIds: [1, 'a'] } as Partial<RegisterDto>);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'roleIds')).toBe(true);
  });
});
