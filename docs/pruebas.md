# Pruebas — Backend (NestJS)

Estrategia de pruebas y casos **pairwise** para el endpoint `POST /auth/register`, documentados junto al bosquejo de la **pirámide de automatización**.

## 1. Estrategia general

- **Frameworks**: [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) + [class-validator](https://github.com/typestack/class-validator) (ya instalados en `package.json`).
- **Enfoque**: pirámide de automatización — más pruebas rápidas y baratas (unitarias) abajo, y menos pruebas end-to-end (lentas y dependientes de infraestructura) arriba.
- **Scripts**:
  - `npm test` → unitarias e integración (`*.spec.ts` dentro de `src/`).
  - `npm run test:e2e` → end-to-end (`*.e2e-spec.ts` dentro de `test/`).

## 2. Pirámide de automatización de pruebas

```
              /\              E2E (Supertest)        pocos casos
             /  \             flujo completo con HTTP real + DB
            /    \            register → login → operar con token JWT
           /------\
          /        \
         /  Integración  \    TestingModule (NestJS)  casos moderados
        /                  \   AuthService + UsersService (mocks/repos reales)
       o--------------------o
      o     Unit (Jest)      o    la mayor cantidad de casos
     o                        o   validaciones DTO, bcrypt, jwt, lógica pura
     o=======================o===  pressupuesto: la base ancha y barata
```

| Nivel | Herramienta | Qué cubre | Ejemplos concretos en este proyecto |
|---|---|---|---|
| E2E | Supertest + DB | Flujos completos por HTTP con la app arrancada | `test/auth.e2e-spec.ts`: registrar → login → token en rutas protegidas |
| Integración | Nest TestingModule | Servicios coordinando repositorios/transacciones | `src/auth/auth.service.spec.ts`: register con duplicado, login exitoso |
| Unit | Jest + class-validator | Validación pura, cálculos, helpers | `src/auth/dto/register.dto.spec.ts`: validaciones del DTO |
| Proporción | — | ≈ 70 % unitarios / 20 % integración / 10 % E2E | casos de la sección 3 |

## 3. Casos de prueba pairwise — `POST /auth/register`

**Técnica de selección**: *pairwise* (combinatoria 2-way). Con `n` parámetros y `m` valores por parámetro no se prueban todas las combinaciones (exhaustivo = 4×3×4 = **48 casos**), sino un subconjunto mínimo donde **cada par de valores aparece al menos una vez** (aquí, **16 casos**).

### 3.1 Particiones de equivalencia

| Parámetro | Clase | Valor representativo | Validez |
|---|---|---|---|
| email (A) | a1: formato válido | `test@mail.com` | Válido |
| email (A) | a2: formato inválido | `test` | Inválido |
| email (A) | a3: vacío (límite min.) | `""` / `null` | Inválido |
| email (A) | a4: ya registrado | `duplicado@mail.com` | Inválido (negocio) |
| password (B) | b1: valor válido | `123456` | Válido |
| password (B) | b2: vacío (límite min.) | `""` | Inválido |
| password (B) | b3: tipo incorrecto | `123` (número) | Inválido |
| roleIds (C) | c1: array de enteros | `[1, 2]` | Válido |
| roleIds (C) | c2: elementos no enteros | `[1, "a"]` | Inválido |
| roleIds (C) | c3: no es array | `5` | Inválido |
| roleIds (C) | c4: ausente | `—` | Válido |

### 3.2 Matriz pairwise (16 casos)

| ID | email | password | roleIds | Respuesta esperada | Técnica |
|---|---|:---:|:---:|---:|:---:|
| PW-01 | a1 válido | b1 válido | c1 `[1,2]` | 201 — usuario creado con roles | PW + EC |
| PW-02 | a1 válido | b2 vacío | c2 no enteros | 400 — validación | PW + BVA |
| PW-03 | a1 válido | b3 número | c3 no array | 400 — validación | PW |
| PW-04 | a1 válido | b1 válido | c4 ausente | 201 — usuario sin roles | PW + EC |
| PW-05 | a2 formato inválido | b2 vacío | c1 `[1,2]` | 400 — validación | PW + EC |
| PW-06 | a2 formato inválido | b3 número | c2 no enteros | 400 — validación | PW |
| PW-07 | a2 formato inválido | b1 válido | c3 no array | 400 — validación | PW |
| PW-08 | a2 formato inválido | b2 vacío | c4 ausente | 400 — validación | PW |
| PW-09 | a3 vacío | b3 número | c1 `[1,2]` | 400 — validación | PW + BVA |
| PW-10 | a3 vacío | b1 válido | c2 no enteros | 400 — validación | PW |
| PW-11 | a3 vacío | b2 vacío | c3 no array | 400 — validación | PW |
| PW-12 | a3 vacío | b3 número | c4 ausente | 400 — validación | PW |
| PW-13 | a4 duplicado | b1 válido | c1 `[1,2]` | 400 — email ya registrado | PW + EC |
| PW-14 | a4 duplicado | b2 vacío | c2 no enteros | 400 — validación | PW |
| PW-15 | a4 duplicado | b3 número | c3 no array | 400 — validación | PW |
| PW-16 | a4 duplicado | b1 válido | c4 ausente | 400 — email ya registrado | PW |

### 3.3 Trazabilidad de pares

Cobertura de **todos** los pares `email × password`, `email × roleIds` y `password × roleIds`:

| Par | Casos | Par | Casos | Par | Casos |
|---|---|---|---|---|---|
| a1×b1 | PW-01, PW-04 | a1×c1 | PW-01 | b1×c1 | PW-01, PW-13 |
| a1×b2 | PW-02 | a1×c2 | PW-02 | b1×c2 | PW-10 |
| a1×b3 | PW-03 | a1×c3 | PW-03 | b1×c3 | PW-07 |
| a2×b1 | PW-07 | a1×c4 | PW-04 | b1×c4 | PW-04, PW-16 |
| a2×b2 | PW-05, PW-08 | a2×c1 | PW-05 | b2×c1 | PW-05 |
| a2×b3 | PW-06 | a2×c2 | PW-06 | b2×c2 | PW-02, PW-14 |
| a3×b1 | PW-10 | a2×c3 | PW-07 | b2×c3 | PW-11 |
| a3×b2 | PW-11 | a2×c4 | PW-08 | b2×c4 | PW-08 |
| a3×b3 | PW-09, PW-12 | a3×c1 | PW-09 | b3×c1 | PW-09 |
| a4×b1 | PW-13, PW-16 | a3×c2 | PW-10 | b3×c2 | PW-06 |
| a4×b2 | PW-14 | a3×c3 | PW-11 | b3×c3 | PW-03, PW-15 |
| a4×b3 | PW-15 | a3×c4 | PW-12 | b3×c4 | PW-12 |
| | | a4×c1 | PW-13 | | |
| | | a4×c2 | PW-14 | | |
| | | a4×c3 | PW-15 | | |
| | | a4×c4 | PW-16 | | |

Cada par aparece al menos en un caso → cobertura 2-way completa con 16 casos (exhaustivo habría sido 48).

### 3.4 Casos complementarios (fuera del pairwise)

| ID | Descripción | Entrada | Respuesta esperada |
|---|---|---|---|
| AD-01 | Campo extra no permitido (`forbidNonWhitelisted`) | `{ email, password, admin: true }` | 400 — campo no permitido |
| AD-02 | `roleIds` con IDs que no existen | `{ email, password, roleIds: [999] }` | 201 — el servicio ignora los IDs no encontrados |
| AD-03 | Cuerpo sin `password` (campo omitido) | `{ email }` | 400 — contraseña requerida |

Se documentan aparte porque no dependen de *pares de valores*, sino de reglas de negocio/pipe globales.

## 4. Archivos de test

| Archivo | Nivel | Qué valida |
|---|---|---|
| `src/auth/dto/register.dto.spec.ts` | Unit | Validaciones del DTO (email, password, roleIds) con class-validator |
| `src/auth/auth.service.spec.ts` | Integración (mocks) | register (éxito, duplicado), login (éxito, credenciales erróneas), no exponer password |
| `test/auth.e2e-spec.ts` | E2E | Flujo HTTP completo register → login; requiere base de datos corriendo |

## 5. Ejecución

```bash
# Unitarias e integración (sin base de datos)
npm test

# E2E: requiere PostgreSQL (docker compose up -d) y el .env configurado
npm run test:e2e
```