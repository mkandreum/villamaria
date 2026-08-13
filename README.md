# 🏡 Villa María - Sistema de Reservas Turísticas (Full-Stack Production)

Aplicación web completa y lista para producción para la gestión de reservas de alojamiento turístico en Villa María. Transformada de un prototipo estático a una plataforma robusta conectada a **PostgreSQL**, con **autenticación JWT**, **panel de administración**, **configuración SMTP desde interfaz gráfica**, **sincronización bidireccional con Google Calendar**, subida de imágenes y despliegue automatizado en **Coolify**.

---

## 🌟 Características Principales

1. **Eliminación Total de Datos Mock**: Todas las reservas, disponibilidad, imágenes, normas, precios y textos provienen de PostgreSQL.
2. **Navegación Flotante en Píldora (Mobile-First)**:
   - Fija en la parte inferior en móviles (`bottom navigation pill`).
   - Fija en la parte superior centrada en escritorios y tablets.
   - Cumple estrictamente con objetivos táctiles de $\ge 44 \times 44\text{px}$ y efectos `backdrop-filter: blur()`.
3. **Autenticación Unificada (JWT & Roles)**: Formulario único para clientes y administradores con detección automática de rol y tokens de refresco.
4. **Configuración SMTP desde Panel Admin (GUI)**:
   - Permite configurar servidor SMTP, puerto, usuario, contraseña cifrada en base de datos con clave maestra (`APP_SECRETS_MASTER_KEY`).
   - Botón de **"Probar conexión SMTP"** y **"Enviar email de prueba"** directo desde el panel sin necesidad de redeploy.
5. **Integración con Google Calendar API**:
   - Creación automática de eventos con datos del huésped y reserva.
   - Eliminación automática de eventos al cancelar.
   - Lectura de eventos externos de Google Calendar para bloquear disponibilidad automáticamente.
6. **Almacenamiento Persistente de Imágenes**:
   - Subida de imágenes a través de `/api/uploads` guardadas en `/app/uploads` (volumen Docker).
7. **Despliegue 1-Click en Coolify**:
   - `docker-compose.yml` optimizado con `healthchecks`, red compartida y volumen persistente de PostgreSQL.

---

## 🚀 Despliegue en Coolify

### 1. Requisitos previos
- Una instancia en funcionamiento de **Coolify**.
- Repositorio de GitHub conectado a Coolify: `https://github.com/mkandreum/villamaria`

### 2. Pasos en Coolify
1. Crea un nuevo **Proyecto** o selecciona uno existente en Coolify.
2. Añade un nuevo servicio del tipo **Docker Compose**.
3. Conecta el repositorio de GitHub o pega el contenido de `docker-compose.yml`.
4. En el apartado **Environment Variables**, define las variables requeridas (ver sección abajo).
5. Haz clic en **Deploy**. Coolify construirá la imagen con el `Dockerfile` multi-stage, levantará el contenedor de PostgreSQL 16 y ejecutará `npx prisma db push` automáticamente.

---

## 📋 Variables de Entorno (`.env.example`)

```env
# App Configuration
NODE_ENV=production
PORT=3000
APP_URL=https://tu-dominio.com
UPLOADS_DIR=/app/uploads

# Autenticación & Secretos
JWT_SECRET=super-secret-jwt-key-change-me-in-coolify
JWT_EXPIRY=7d
APP_SECRETS_MASTER_KEY=master-encryption-key-for-smtp-passwords-32-chars!

# Credenciales Iniciales de Administrador
ADMIN_EMAIL=admin@villamaria.com
ADMIN_PASSWORD=CambiarEstaPassword123!

# Base de Datos PostgreSQL
POSTGRES_USER=villamaria
POSTGRES_PASSWORD=villamaria_secure_password_2026
POSTGRES_DB=reservas
DATABASE_URL=postgresql://villamaria:villamaria_secure_password_2026@postgres:5432/reservas?schema=public

# SMTP Email (Opcional - Se puede configurar desde el Panel Admin GUI sin redeploy)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-gmail
SMTP_FROM_NAME=Villa María Reservas
ADMIN_NOTIFY_EMAIL=admin@villamaria.com

# Integración con Google Calendar API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary
```

---

## 💻 Desarrollo Local

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/mkandreum/villamaria.git
cd villamaria
npm install
```

### 2. Configurar variables de entorno local
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

### 3. Levantar la base de datos PostgreSQL localmente
```bash
docker compose up -d postgres
```

### 4. Sincronizar el esquema de base de datos e iniciar servidor
```bash
npx prisma db push
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 🛠️ Estructura del Proyecto

```
villamaria/
├── Dockerfile                   # Dockerfile multi-stage para producción
├── docker-compose.yml           # Configuración compatible con Coolify (Web + PostgreSQL)
├── .env.example                 # Guía de variables de entorno
├── prisma/
│   └── schema.prisma            # Esquema ORM (Users, Reservations, SMTP, Settings, etc.)
├── server/
│   ├── index.ts                 # Servidor Express API REST & Inicialización DB
│   ├── db.ts                    # Singleton de Prisma Client
│   └── utils/
│       ├── crypto.ts            # Cifrado AES-256-GCM para contraseñas SMTP
│       ├── mailer.ts            # Cargador dinámico de transporte SMTP
│       └── googleCalendar.ts    # Conector con Google Calendar API
├── src/
│   ├── api.ts                   # Cliente API frontend
│   ├── components/
│   │   ├── Navbar.tsx           # Barra de navegación flotante tipo Píldora
│   │   ├── AdminModal.tsx       # Hub de Administración completo
│   │   ├── AuthModal.tsx        # Modal de login/registro unificado
│   │   └── admin/
│   │       └── SmtpSettingsSection.tsx  # GUI para configuración SMTP en vivo
│   ├── App.tsx                  # Componente principal React
│   └── index.css                # Estilos Tailwind CSS
└── package.json
```
