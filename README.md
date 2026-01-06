# FinanceApp - Sistema de Gestión de Ingresos y Gastos

Sistema fullstack para gestionar movimientos financieros, usuarios y reportes. Desarrollado con Next.js, TypeScript, Prisma y Better Auth.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.2-green)
![Tests](https://img.shields.io/badge/Tests-36%20passing-success)

## 🚀 Características

- **Autenticación**: Login con GitHub usando Better Auth
- **RBAC**: Control de acceso basado en roles (USER/ADMIN)
- **Movimientos**: CRUD de ingresos y egresos
- **Usuarios**: Gestión de usuarios (solo admin)
- **Reportes**: Gráficos, estadísticas y exportación a CSV
- **API REST**: Documentada con OpenAPI/Swagger en `/api/docs`
- **Dark Mode**: Interfaz elegante estilo Vercel/GitHub

## 📋 Requisitos Previos

- Node.js 18+
- npm o bun
- Cuenta en [Supabase](https://supabase.com) (base de datos PostgreSQL)
- Cuenta en [GitHub](https://github.com/settings/developers) (OAuth App)

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/prueba-tecnica-fullstack.git
cd prueba-tecnica-fullstack
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Better Auth
BETTER_AUTH_SECRET="genera-un-string-aleatorio-de-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="tu-client-id"
GITHUB_CLIENT_SECRET="tu-client-secret"
```

#### Obtener DATABASE_URL de Supabase:

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto → Settings → Database
3. Copiar la Connection String (Session Pooler para mejor compatibilidad)

#### Obtener credenciales de GitHub:

1. Ir a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crear nueva OAuth App
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`

### 4. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Scripts Disponibles

| Script                  | Descripción                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Inicia el servidor de desarrollo |
| `npm run build`         | Compila para producción          |
| `npm run start`         | Inicia el servidor de producción |
| `npm run lint`          | Ejecuta el linter                |
| `npm test`              | Ejecuta las pruebas unitarias    |
| `npm run test:watch`    | Ejecuta tests en modo watch      |
| `npm run test:coverage` | Ejecuta tests con cobertura      |

## 🧪 Pruebas Unitarias

El proyecto incluye **36 pruebas unitarias** que cubren:

- **Utilidades de formateo**: Moneda, fechas, cálculo de balance
- **Validaciones**: Movimientos, actualización de usuarios
- **Componentes**: Sidebar con RBAC

```bash
npm test
```

## 📖 Documentación de la API

La documentación está disponible en `/api/docs` usando Swagger UI.

### Endpoints principales:

| Método | Endpoint           | Descripción        | Acceso |
| ------ | ------------------ | ------------------ | ------ |
| GET    | `/api/me`          | Usuario actual     | Auth   |
| GET    | `/api/movements`   | Listar movimientos | Auth   |
| POST   | `/api/movements`   | Crear movimiento   | Admin  |
| GET    | `/api/users`       | Listar usuarios    | Admin  |
| PUT    | `/api/users/[id]`  | Editar usuario     | Admin  |
| GET    | `/api/reports`     | Datos de reporte   | Admin  |
| GET    | `/api/reports/csv` | Descargar CSV      | Admin  |

## 🚀 Deploy en Vercel

### 1. Conectar repositorio

1. Ir a [Vercel](https://vercel.com)
2. Importar el repositorio de GitHub
3. Configurar las variables de entorno

### 2. Variables de entorno en Vercel

Agregar las mismas variables del `.env`:

| Variable                      | Valor                                           |
| ----------------------------- | ----------------------------------------------- |
| `DATABASE_URL`                | Tu connection string de Supabase                |
| `BETTER_AUTH_SECRET`          | String aleatorio de 32+ caracteres              |
| `BETTER_AUTH_URL`             | URL de tu app (ej: `https://tu-app.vercel.app`) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Igual que BETTER_AUTH_URL                       |
| `GITHUB_CLIENT_ID`            | Client ID de GitHub OAuth                       |
| `GITHUB_CLIENT_SECRET`        | Client Secret de GitHub OAuth                   |

### 3. Actualizar GitHub OAuth

En GitHub Developer Settings, actualizar la OAuth App con la URL de producción:

- Homepage URL: `https://tu-app.vercel.app`
- Callback URL: `https://tu-app.vercel.app/api/auth/callback/github`

### 4. Deploy

Vercel detectará automáticamente Next.js y ejecutará el build.

## 🏗️ Estructura del Proyecto

```
├── __tests__/              # Pruebas unitarias (36 tests)
├── components/
│   ├── layout/             # Layout y Sidebar
│   └── ui/                 # Componentes Shadcn
├── lib/
│   ├── auth/               # Configuración de Better Auth
│   ├── utils/              # Utilidades (formateo, validación)
│   ├── openapi.ts          # Especificación OpenAPI
│   └── prisma.ts           # Cliente de Prisma (singleton)
├── pages/
│   ├── api/                # API Routes
│   │   ├── auth/           # Better Auth handler
│   │   ├── movements/      # CRUD de movimientos
│   │   ├── users/          # Gestión de usuarios
│   │   ├── reports/        # Reportes y CSV
│   │   ├── docs.ts         # Swagger UI
│   │   └── me.ts           # Usuario actual
│   ├── index.tsx           # Dashboard
│   ├── login.tsx           # Login con GitHub
│   ├── movements.tsx       # Gestión de movimientos
│   ├── users.tsx           # Gestión de usuarios
│   └── reports.tsx         # Reportes y gráficos
├── prisma/
│   └── schema.prisma       # Schema de la base de datos
├── styles/
│   └── globals.css         # Estilos globales (Dark Mode)
└── types/
    └── file-system.d.ts    # Tipos para File System API
```

## 🔒 Seguridad

- **Autenticación**: Sesiones almacenadas en base de datos con Better Auth
- **RBAC**: Middleware `withAuth` para autorización por roles
- **Validación**: Datos validados en frontend y backend
- **Protección de rutas**: APIs rechazan peticiones no autenticadas

## 👥 Roles

| Rol       | Permisos                                          |
| --------- | ------------------------------------------------- |
| **USER**  | Ver y gestionar movimientos                       |
| **ADMIN** | Acceso completo (movimientos, usuarios, reportes) |

> **Nota**: Por requisito de la prueba, todos los usuarios nuevos se crean con rol ADMIN.

## 🛡️ Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: Better Auth con GitHub OAuth
- **Testing**: Jest, Testing Library
- **Documentación**: OpenAPI/Swagger

---

Desarrollado para prueba técnica de PrevalentWare.
