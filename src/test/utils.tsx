import { render } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from '../funcionalidades/auth/AuthContext'
import type { Rol, Sesion } from '../funcionalidades/auth/tipos'
import { crearQueryClient } from '../lib/queryClient'
import { rutasConfig } from '../router'

export interface OpcionesRenderApp {
  rutaInicial?: string
  sesionInicial?: Sesion
}

export function crearSesionPrueba(
  rol: Rol = 'USER',
  datos?: { username?: string; email?: string; firstName?: string },
): Sesion {
  const emailPorDefecto =
    rol === 'ADMIN'
      ? 'admin@pulsepass.test'
      : rol === 'STAFF'
        ? 'laura@pulsepass.test'
        : 'andrea@pulsepass.test'

  const usernamePorDefecto =
    rol === 'ADMIN' ? 'admin' : rol === 'STAFF' ? 'laura' : 'andrea'

  const firstNamePorDefecto =
    rol === 'ADMIN' ? 'Administración' : rol === 'STAFF' ? 'Laura' : 'Andrea'

  return {
    estado: 'autenticado',
    token: `jwt-test-${rol.toLowerCase()}`,
    expiraEn: Date.now() + 900_000,
    usuario: {
      id: 1,
      username: datos?.username ?? usernamePorDefecto,
      email: datos?.email ?? emailPorDefecto,
      firstName: datos?.firstName ?? firstNamePorDefecto,
      lastName: 'Demo',
      roles: [rol],
    },
  }
}

export function renderConProveedores(opciones?: OpcionesRenderApp) {
  const rutaInicial = opciones?.rutaInicial ?? '/'
  const sesionEfectiva =
    opciones && 'sesionInicial' in opciones
      ? opciones.sesionInicial
      : ({ estado: 'anonimo' } as Sesion)
  const queryClient = crearQueryClient()
  const memoryRouter = createMemoryRouter(rutasConfig, {
    initialEntries: [rutaInicial],
  })

  const resultado = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider sesionInicial={sesionEfectiva}>
        <RouterProvider router={memoryRouter} />
      </AuthProvider>
    </QueryClientProvider>,
  )

  return {
    ...resultado,
    queryClient,
    router: memoryRouter,
  }
}
