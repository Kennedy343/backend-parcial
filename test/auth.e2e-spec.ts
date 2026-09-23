import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const usuario = {
    email: `e2e_${Date.now()}@mail.com`,
    password: '123456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register crea un usuario sin exponer la password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(usuario)
      .expect(201);

    expect(res.body.message).toBe('Usuario registrado correctamente');
    expect(res.body.user.password).toBeUndefined();
  });

  it('POST /auth/register rechaza un email duplicado', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(usuario)
      .expect(400);
  });

  it('POST /auth/register rechaza campos extra (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...usuario, admin: true })
      .expect(400);
  });

  it('POST /auth/register rechaza email inválido', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'email-invalido', password: '123456' })
      .expect(400);
  });

  it('POST /auth/login devuelve access_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(usuario)
      .expect(201);

    expect(res.body.access_token).toBeDefined();
  });

  it('POST /auth/login rechaza credenciales inválidas', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: usuario.email, password: 'incorrecta' })
      .expect(401);
  });
});
