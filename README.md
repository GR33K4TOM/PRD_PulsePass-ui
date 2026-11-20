# PulsePass — Frontend Web (Fase 5)

Cliente web SPA para la plataforma **PulsePass** de eventos, artistas y entradas, construido con **React 19**, **TypeScript (strict)**, **Tailwind CSS v4**, **React Router**, **TanStack Query v5**, **React Hook Form + Zod** y **Vitest + Testing Library + MSW**.

## Requisitos previos

- **Node.js 22.22+** y **npm**.
- Backend de PulsePass (Fases 1 a 4) ejecutándose en `http://localhost:8080`.

## Configuración y variables de entorno

Copia `.env.example` a `.env` si necesitas personalizar la ruta base de la API (por defecto usa `/api` a través del proxy de Vite en desarrollo):

```bash
cp .env.example .env
```

Variables disponibles:
- `VITE_API_BASE_URL`: prefijo para las peticiones HTTP (por defecto `/api`). No almacena secretos.

## Comandos principales

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173 con proxy /api -> http://localhost:8080)
npm run dev

# Compilación de producción (verificación estricta con tsc + vite build)
npm run build

# Análisis estático (ESLint)
npm run lint

# Ejecutar suite de pruebas automatizadas (Vitest + Testing Library + MSW)
npm test
```

## Roles de demostración y usuarios de referencia

| Persona | Perfil | Rol de UI | Correo de referencia |
|---|---|---|---|
| **Andrea** | Adulta, activa | `USER` | `andrea@pulsepass.test` |
| **Carlos** | Adulto, activo | `USER` | `carlos@pulsepass.test` |
| **Laura** | 17 años / Operación | `USER` / `STAFF` | `laura@pulsepass.test` |
| **Miguel** | Adulto, inactivo | `USER` (login rechazado) | `miguel@pulsepass.test` |
| **Administración** | Semilla local F4 | `ADMIN` | `admin@pulsepass.test` |

## Mapa de rutas principales

| Ruta | Página | Acceso | Descripción |
|---|---|---|---|
| `/` | `Inicio` | Pública | Hero, próximos eventos y artistas destacados |
| `/eventos` | `CatalogoEventos` | Pública | Cartelera filtrable por nombre (`?q=`), categoría (`?categoria=`) y artista (`?artista=`) |
| `/eventos/:eventCode` | `DetalleEvento` | Pública | Detalle del evento, artistas, sede y compra de entradas (`USER`) |
| `/artistas` | `ListaArtistas` | Pública | Cuadrícula de artistas activos |
| `/artistas/:id` | `DetalleArtista` | Pública | Perfil del artista y próximos eventos |
| `/sedes` | `ListaSedes` | Pública | Listado de sedes activas |
| `/sedes/:code` | `DetalleSede` | Pública | Detalle de sede por código |
| `/login` | `Login` | Solo anónimo | Inicio de sesión con JWT en `sessionStorage` y memoria |
| `/registro` | `Registro` | Solo anónimo | Registro de cuenta de usuario (`USER`) |
| `/cuenta` | `Cuenta` | Autenticada | Resumen del perfil del usuario autenticado |
| `/mis-tickets` | `MisTickets` | `USER` | Tickets del usuario con filtro por estado y cancelación |
| `/mis-tickets/:ticketCode` | `DetalleTicket` | `USER` | Detalle de ticket con código copiable y cancelación |
| `/compra/confirmacion/:ticketCode` | `ConfirmacionCompra` | `USER` | Confirmación tras compra exitosa |
| `/staff/validacion` | `ValidacionIngreso` | `STAFF`, `ADMIN` | Búsqueda de ticket por código y registro de ingreso (`USED`) |
| `/staff/eventos/:eventCode/tickets` | `TicketsPagadosEvento` | `STAFF`, `ADMIN` | Tabla (y tarjetas en móvil) de tickets `PAID` por evento |
| `/admin/eventos` | `AdminEventos` | `ADMIN` | Búsqueda de eventos por código y listado de creados en la sesión |
| `/admin/eventos/nuevo` | `AdminCrearEvento` | `ADMIN` | Creación de nuevo evento en estado `DRAFT` |
| `/admin/eventos/:eventCode` | `AdminGestionEvento` | `ADMIN` | Publicación de evento y asociación de artistas |
| `/403` | `SinPermisos` | Pública | Página de acceso denegado por rol insuficiente |
| `*` | `NoEncontrada` | Pública | Página 404 para rutas inexistentes |
