

<div align="center">

# Cantio

### Reproductor de música de código abierto priorizando la privacidad

**Escucha música en streaming. Controla tus datos. No se requiere cuenta.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://music.akshayka.dev/)

**[🌐 Aplicación Web](https://music.akshayka.dev/) · **[📖 Contribuir](./CONTRIBUTING.md)** · **[📦 Descargar para Escritorio](#-desktop-downloads)**

</div>

---

## ¿Qué es Cantio?

La mayoría de las aplicaciones de música exigen una cuenta antes de que puedas reproducir algo. Rastrear todo lo que escuchas, venden esos datos a anunciantes y bloquean funciones tras suscripciones de pago.

**Cantio no hace nada de eso.**

- Busca y reproduce sin registrarte
- Sin analíticas, sin telemetría, sin anuncios
- Crea una cuenta *solo* si deseas sincronizar entre dispositivos
- Totalmente de código abierto: audita cada línea

---

## Características

### Reproducción
- 🎵 Streaming desde YouTube Music: sin anuncios, sin interrupciones
- ⏭️ Saltos ilimitados
- 🔁 Modos aleatorio, repetir pista y repetir cola
- 🕹️ Reordenar cola arrastrando y soltando con desplazamiento automático
- 📜 Panel de letras sincronizadas

### Biblioteca
- ❤️ Canciones favoritas
- 📋 Múltiples listas de reproducción
- 🔀 Mezclas (Blends): combina tu gusto con el de un amigo y obtén una lista compartida
- ⏳ Historial de reproducción con cola inversa (botón de anterior que realmente funciona)

### Privacidad y Sincronización
- 👤 Modo invitado: funciona totalmente sin conexión, nunca se requiere inicio de sesión
- ☁️ Sincronización opcional de cuenta: canciones favoritas, listas e historial en varios dispositivos
- 🔓 Código abierto: sin cajas negras

### Plataformas
- 🌐 Aplicación web (PWA: instalable en cualquier dispositivo)
- 🖥️ Aplicación de escritorio (Windows, Linux)
- 📱 Aplicación móvil (en progreso)

---

## Pruébalo Ahora

| Plataforma | Enlace |
|---|---|
| Aplicación Web | [music.akshayka.dev](https://music.akshayka.dev/) |
| Página de inicio | [/landing](https://music.akshayka.dev/landing) |

No se requiere registro. Busca una canción y haz clic en reproducir.

---

## Descargas para Escritorio

| Plataforma | Archivo |
|---|---|
| Windows | [Cantio.Setup.1.0.0.exe](https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/Cantio.Setup.1.0.0.exe) |
| Linux — Debian/Ubuntu | [cantio-desktop_1.0.0_amd64.deb](https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/cantio-desktop_1.0.0_amd64.deb) |
| Linux — AppImage | [Cantio-1.0.0.AppImage](https://github.com/akshay-k-a-dev/Cantio/releases/download/cantio-initial/Cantio-1.0.0.AppImage) |
| Android | Próximamente |

---

## Tecnologías Utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Framer Motion |
| Backend | Fastify, TypeScript, Prisma, PostgreSQL |
| Búsqueda / Metadatos | Innertube (youtubei.js) |
| Reproducción | YouTube IFrame Player API |
| Escritorio | Electron |
| Despliegue | Vercel (serverless) |

---

## Estructura del Proyecto

```
vercel-serverless/
├── backend/          # Fastify API + Prisma ORM
│   ├── src/routes/   # auth, likes, playlists, blends, history, recommendations
│   └── prisma/       # schema + migrations
└── frontend/         # React + Vite client
    └── src/
        ├── pages/    # Home, Search, Queue, Playlists, Blends, Profile …
        ├── components/
        ├── services/ # player service (YouTube IFrame + queue logic)
        └── lib/      # Zustand stores, IndexedDB cache
desktop-app/          # Electron wrapper
mobile-app/           # React Native app (in progress)
```

---

## Desarrollo Local

### Frontend

```bash
cd vercel-serverless/frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd vercel-serverless/backend
npm install
# create .env — see below
npx prisma migrate dev
npm run dev        # http://localhost:3000
```

#### `.env` del Backend

```env
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
```

#### `.env` del Frontend

```env
VITE_API_URL=http://localhost:3000/api
```

> ⚠️ **No cambies `VITE_API_URL` en producción** sin coordinarte con el responsable del despliegue: apunta al backend activo en Vercel. Cambiarlo romperá el sitio en vivo.

---

## Resumen de la API

Base URL: `https://music-mu-lovat.vercel.app/api`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | — | Verificación de estado |
| GET | `/search?q=&limit=` | — | Buscar pistas |
| GET | `/track/:id` | — | Metadatos de la pista |
| POST | `/auth/register` | — | Registro |
| POST | `/auth/login` | — | Inicio de sesión (devuelve JWT) |
| GET | `/likes` | ✅ | Obtener pistas favoritas |
| POST | `/likes` | ✅ | Marcar una pista como favorita |
| GET | `/playlists` | ✅ | Listar listas de reproducción |
| POST | `/playlists` | ✅ | Crear lista de reproducción |
| GET | `/recommendations` | ✅ | Recomendaciones personalizadas |
| POST | `/blends/invite` | ✅ | Enviar invitación de mezcla |
| GET | `/blends` | ✅ | Listar mezclas |

---

## Hoja de Ruta

- [x] Sistema básico de reproducción + cola
- [x] Canciones favoritas + listas de reproducción
- [x] Mezclas (Blends, listas colaborativas)
- [x] Reordenar cola arrastrando y soltando
- [x] Aplicación de escritorio (Windows + Linux)
- [x] Modos aleatorio / repetir
- [x] Panel de letras
- [x] Búsqueda en YT Music (canciones, álbumes, artistas, listas)
- [ ] Aplicación para Android
- [ ] Versión de escritorio para macOS
- [ ] Soporte para backend autoalojado
- [ ] Integración de scrobbling con Last.fm

---

## Contribuir

Consulta [CONTRIBUTING.md](./CONTRIBUTING.md) para la configuración, estilo de commits y flujo de trabajo de PRs.

---

## Aviso Legal

> ⚠️ Cantio no está afiliado ni respaldado por Google LLC o YouTube.
> El streaming utiliza la API oficial de YouTube IFrame Player bajo los términos de servicio de YouTube.
> No se almacena ni redistribuye material con derechos de autor.

---

## Licencia

MIT: consulta [LICENSE](./LICENSE).

---

<div align="center">
Hecho con 💜 para los oyentes que buscan control, simplicidad y tranquilidad.
</div>
