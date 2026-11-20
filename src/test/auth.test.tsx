import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from './setup'
import { crearSesionPrueba, renderConProveedores } from './utils'

describe('21.2 Autenticación y guardas', () => {
  it('TEST-FE-AUTH-001: login válido establece sesión autenticada y redirige a origen', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: { estado: 'anonimo' },
    })

    expect(await screen.findByRole('heading', { name: /Inicia sesión/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Usuario o correo/i), 'andrea')
    await user.type(screen.getByLabelText(/Contraseña/i), 'PasswordSegura123!')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByRole('heading', { name: /Mis tickets/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/mis-tickets')
  })

  it('TEST-FE-AUTH-002: login 401 muestra "Credenciales inválidas"', async () => {
    const user = userEvent.setup()
    renderConProveedores({ rutaInicial: '/login' })

    expect(await screen.findByRole('heading', { name: /Inicia sesión/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Usuario o correo/i), 'invalido')
    await user.type(screen.getByLabelText(/Contraseña/i), 'incorrecta')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Credenciales inválidas/i)
  })

  it('TEST-FE-AUTH-003: login sin campos muestra errores y realiza 0 peticiones', async () => {
    const user = userEvent.setup()
    let peticiones = 0
    server.use(
      http.post('/api/auth/login', () => {
        peticiones += 1
        return HttpResponse.json({ accessToken: 'tok', expiresIn: 900 })
      }),
    )

    renderConProveedores({ rutaInicial: '/login' })
    expect(await screen.findByRole('heading', { name: /Inicia sesión/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByText(/Ingresa tu usuario o correo/i)).toBeInTheDocument()
    expect(screen.getByText(/Ingresa tu contraseña/i)).toBeInTheDocument()
    expect(peticiones).toBe(0)
  })

  it('TEST-FE-AUTH-004: registro con contraseña corta muestra error y 0 peticiones', async () => {
    const user = userEvent.setup()
    let peticiones = 0
    server.use(
      http.post('/api/users', () => {
        peticiones += 1
        return HttpResponse.json({}, { status: 201 })
      }),
    )

    renderConProveedores({ rutaInicial: '/registro' })
    expect(await screen.findByRole('heading', { name: /Crea tu cuenta/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'andrea')
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'andrea@pulsepass.test')
    await user.type(screen.getByLabelText(/Nombres/i), 'Andrea')
    await user.type(screen.getByLabelText(/Apellidos/i), 'Ruiz')
    await user.type(screen.getByLabelText(/Fecha de nacimiento/i), '1998-04-12')
    await user.type(screen.getByLabelText(/Contraseña/i), 'corta123')
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    expect(
      await screen.findByText(/La contraseña debe tener al menos 12 caracteres/i),
    ).toBeInTheDocument()
    expect(peticiones).toBe(0)
  })

  it('TEST-FE-AUTH-005: registro 201 redirige a /login con aviso', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({ rutaInicial: '/registro' })

    expect(await screen.findByRole('heading', { name: /Crea tu cuenta/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'nuevousuario')
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'nuevo@pulsepass.test')
    await user.type(screen.getByLabelText(/Nombres/i), 'Nuevo')
    await user.type(screen.getByLabelText(/Apellidos/i), 'Usuario')
    await user.type(screen.getByLabelText(/Fecha de nacimiento/i), '1999-01-15')
    await user.type(screen.getByLabelText(/Contraseña/i), 'ContrasenaMuySegura123')
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    expect(await screen.findByText(/Cuenta creada, inicia sesión/i)).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('TEST-FE-AUTH-006: registro 409 muestra mensaje genérico sin detalles internos', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('/api/users', () => {
        return HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'Key (email)=(andrea@pulsepass.test) already exists in table users',
            details: {},
          },
          { status: 409 },
        )
      }),
    )

    renderConProveedores({ rutaInicial: '/registro' })
    expect(await screen.findByRole('heading', { name: /Crea tu cuenta/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'andrea')
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'andrea@pulsepass.test')
    await user.type(screen.getByLabelText(/Nombres/i), 'Andrea')
    await user.type(screen.getByLabelText(/Apellidos/i), 'Ruiz')
    await user.type(screen.getByLabelText(/Fecha de nacimiento/i), '1998-04-12')
    await user.type(screen.getByLabelText(/Contraseña/i), 'ContrasenaMuySegura123')
    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    expect(
      await screen.findByText(/El usuario o correo ya está registrado/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-007: RutaProtegida redirige anónimo a /login con state.desde', async () => {
    const { router } = renderConProveedores({
      rutaInicial: '/cuenta',
      sesionInicial: { estado: 'anonimo' },
    })

    expect(await screen.findByRole('heading', { name: /Inicia sesión/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect((router.state.location.state as { desde?: string })?.desde).toBe('/cuenta')
  })

  it('TEST-FE-AUTH-008: RutaPorRol redirige USER en /admin/eventos a /403', async () => {
    const { router } = renderConProveedores({
      rutaInicial: '/admin/eventos',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(
      await screen.findByText(/No tienes permisos para acceder a esta sección/i),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('TEST-FE-AUTH-009: RutaPorRol permite ADMIN en /admin/eventos y renderiza', async () => {
    renderConProveedores({
      rutaInicial: '/admin/eventos',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })

    expect(
      await screen.findByRole('heading', { name: /Administración de eventos/i }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-010: cerrar sesión limpia token y caché', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(
      'pulsepass_auth',
      JSON.stringify({ token: 'jwt-test-user', expiraEn: Date.now() + 900000 }),
    )

    const { queryClient } = renderConProveedores({
      rutaInicial: '/cuenta',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(await screen.findByRole('heading', { name: /Mi cuenta/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Cerrar sesión/i }))

    expect(sessionStorage.getItem('pulsepass_auth')).toBeNull()
    expect(queryClient.getQueryCache().getAll().length).toBeLessThanOrEqual(2)
  })

  it('TEST-FE-AUTH-011: token expirado al restaurar sesión queda como anónimo', async () => {
    sessionStorage.setItem(
      'pulsepass_auth',
      JSON.stringify({ token: 'jwt-vencido', expiraEn: Date.now() - 5000 }),
    )

    const { router } = renderConProveedores({
      rutaInicial: '/cuenta',
      sesionInicial: undefined,
    })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
    expect(sessionStorage.getItem('pulsepass_auth')).toBeNull()
  })
})
