# Foro App - Aplicación de Foro Completa

Una aplicación de foro moderna construida con Next.js 14, TypeScript, Prisma ORM y PostgreSQL, con autenticación completa y panel de administración.

## 🚀 Características

- **Autenticación completa** con NextAuth.js (Credentials + base para Google OAuth)
- **Sistema de roles** (Usuario/Administrador)
- **CRUD completo** de publicaciones con estados (Borrador/Publicado)
- **Sistema de comentarios** con moderación
- **Me gusta** y compartir publicaciones
- **Sistema de etiquetas** para categorización
- **Búsqueda avanzada** por título, contenido y etiquetas
- **Panel de administración** completo con moderación
- **Auditoría** de todas las acciones del sistema
- **Sanitización de contenido** para prevenir XSS
- **Responsive design** con Tailwind CSS
- **SEO optimizado** con metadatos dinámicos

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Base de datos:** PostgreSQL (AWS RDS)
- **ORM:** Prisma
- **Autenticación:** NextAuth.js
- **Validación:** Zod + React Hook Form
- **Sanitización:** DOMPurify
- **Hashing:** bcrypt

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Acceso a PostgreSQL (AWS RDS configurado)

## 🔧 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repositorio>
cd foro-app
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Base de datos PostgreSQL en AWS RDS
DATABASE_URL="postgresql://postgres:Ddli%242024@database-1.cwni8qkeq51c.us-east-1.rds.amazonaws.com:5432/proyecto-aws?schema=public&sslmode=require"

# NextAuth configuración
NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui-cambialo"
NEXTAUTH_URL="http://localhost:3000"
```

**⚠️ Importante sobre la contraseña:**
- La contraseña contiene el símbolo `$` que debe ser codificado como `%24` en la URL
- Original: `Ddli$2024` → Codificado: `Ddli%242024`

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Poblar con datos de ejemplo
npm run db:seed
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Modelos Principales (en español)

- **usuarios** - Información de usuarios y autenticación
- **publicaciones** - Publicaciones del foro con estados y slugs únicos
- **comentarios** - Comentarios en publicaciones
- **me_gustas** - Sistema de likes
- **etiquetas** - Etiquetas para categorización
- **publicaciones_etiquetas** - Relación many-to-many
- **auditorias** - Registro de todas las acciones
- **compartidos** - Registro de compartir publicaciones

### SQL de Migración Generado

```sql
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('USUARIO', 'ADMIN');
CREATE TYPE "EstadoPublicacion" AS ENUM ('BORRADOR', 'PUBLICADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT,
    "email" TEXT NOT NULL,
    "hash_contrasena" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'USUARIO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'BORRADOR',
    "autor_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- [Continúa con todas las tablas...]
```

## 👥 Usuarios de Prueba

Después del seed, tendrás estos usuarios disponibles:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@gmail.com | Admin123! | ADMIN |
| juan.perez@gmail.com | User123! | USUARIO |
| maria.garcia@gmail.com | User123! | USUARIO |
| carlos.lopez@gmail.com | User123! | USUARIO |

## 🔐 Configuración de Seguridad AWS RDS

### Security Group

Asegúrate de que tu Security Group permita conexiones en el puerto 5432:

1. Ve a EC2 → Security Groups
2. Encuentra el Security Group de tu RDS
3. Agrega regla de entrada:
   - Tipo: PostgreSQL
   - Puerto: 5432
   - Origen: Tu IP o 0.0.0.0/0 (para desarrollo)

### SSL/TLS

La conexión usa `sslmode=require` por defecto. Si tienes problemas:

```env
# Alternativa sin SSL (solo desarrollo)
DATABASE_URL="postgresql://postgres:Ddli%242024@database-1.cwni8qkeq51c.us-east-1.rds.amazonaws.com:5432/proyecto-aws?schema=public&sslmode=disable"
```

## 🐳 Docker (Opcional)

Para desarrollo local con PostgreSQL:

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: foro_local
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Usar base de datos local
docker-compose up -d

# Cambiar DATABASE_URL en .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/foro_local"
```

## 📁 Estructura del Proyecto

```
foro-app/
├── app/                    # App Router de Next.js
│   ├── api/               # Route handlers
│   ├── auth/              # Páginas de autenticación
│   ├── admin/             # Panel de administración
│   ├── dashboard/         # Dashboard de usuario
│   └── publicacion/       # Páginas de publicaciones
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   ├── forms/            # Formularios
│   ├── layout/           # Componentes de layout
│   ├── publicaciones/    # Componentes de publicaciones
│   └── admin/            # Componentes de admin
├── lib/                  # Utilidades y configuración
│   ├── auth.ts           # Configuración NextAuth
│   ├── authz.ts          # Helpers de autorización
│   ├── db.ts             # Cliente Prisma
│   └── sanitize.ts       # Sanitización de contenido
├── prisma/               # Schema y migraciones
└── types/                # Tipos TypeScript
```

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción

# Base de datos
npm run db:generate     # Generar cliente Prisma
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Poblar con datos
npm run db:studio       # Abrir Prisma Studio

# Otros
npm run lint            # Linting
npm test                # Tests
```

## 🔒 Seguridad Implementada

- **Sanitización de HTML** con DOMPurify
- **Validación de entrada** con Zod
- **Hashing de contraseñas** con bcrypt
- **Autorización en servidor** en todas las rutas
- **Rate limiting** básico
- **Borrado lógico** con campos `visible` y `activo`
- **Auditoría completa** de acciones

## 📱 Funcionalidades por Rol

### Usuario Autenticado
- ✅ Crear, editar, eliminar sus publicaciones
- ✅ Comentar en publicaciones
- ✅ Dar "me gusta"
- ✅ Compartir publicaciones
- ✅ Editar su perfil

### Administrador
- ✅ Todo lo anterior +
- ✅ Gestión completa de usuarios
- ✅ Moderación de publicaciones
- ✅ Moderación de comentarios
- ✅ Acceso a auditoría
- ✅ Ocultar/mostrar contenido

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Variables de entorno para producción:

```env
DATABASE_URL="tu-url-de-produccion"
NEXTAUTH_SECRET="secreto-super-seguro-para-produccion"
NEXTAUTH_URL="https://tu-dominio.com"
```

## 🐛 Solución de Problemas

### Error de conexión a RDS
- Verifica el Security Group
- Confirma que la URL esté correctamente codificada
- Prueba la conexión con `npx prisma db pull`

### Error de migraciones
```bash
# Resetear base de datos (¡CUIDADO en producción!)
npx prisma migrate reset

# Aplicar migraciones manualmente
npx prisma db push
```

### Error de autenticación
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Confirma que las contraseñas hasheadas coincidan

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Créditos

- Next.js por el framework
- Prisma por el ORM
- Tailwind CSS por el styling
- NextAuth.js por la autenticación
