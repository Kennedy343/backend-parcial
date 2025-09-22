# 🔐 NestJS CRUD + Autenticación

Este proyecto es una **API REST** desarrollada con **NestJS** que permite realizar operaciones CRUD sobre una entidad y cuenta con **autenticación basada en JWT** para proteger rutas específicas.

## 🛠 Tecnologías utilizadas

- [NestJS](https://nestjs.com/) (TypeScript)  
- [PostgreSQL](https://www.postgresql.org/)  
- [TypeORM](https://typeorm.io/) 
- [JWT](https://jwt.io/) para autenticación  
- [class-validator](https://github.com/typestack/class-validator) y [class-transformer](https://github.com/typestack/class-transformer) para validación de datos  

## 📂 Funcionalidades principales

- **CRUD completo**: crear, leer, actualizar y eliminar registros  
- **Autenticación JWT**: login y registro de usuarios  
- **Protección de rutas**: algunas rutas requieren un token válido  
- **Validación de datos**: usando DTOs y `class-validator`  


## 🚀 Instalación y ejecución local

1. Clona el repositorio:

```bash
git clone https://github.com/TU_USUARIO/nombre-del-repositorio.git
cd nombre-del-repositorio
