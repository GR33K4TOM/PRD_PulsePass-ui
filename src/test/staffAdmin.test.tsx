import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ARTISTAS_MOCK, EVENTOS_MOCK } from './mocks/handlers'
import { server } from './setup'
import { crearSesionPrueba, renderConProveedores } from './utils'

describe('21.5 STAFF y ADMIN', () => {
  it('TEST-FE-STF-001: validar ingreso busca ticket y lo marca como usado con éxito', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/staff/validacion',
      sesionInicial: crearSesionPrueba('STAFF'),
    })

    expect(
      await screen.findByRole('heading', { name: /Validación de ingreso/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Código de ticket/i), 'TKT-8F2A1C')
    await user.click(screen.getByRole('button', { name: /Buscar/i }))

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Marcar como usado/i }))

    expect(await screen.findByText(/Ingreso registrado/i)).toBeInTheDocument()
  })

  it('TEST-FE-STF-002: validar ingreso por segunda vez muestra 409 visible', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch('/api/tickets/:ticketCode/use', () => {
        return HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El ticket ya fue utilizado.',
            details: {},
          },
          { status: 409 },
        )
      }),
    )

    renderConProveedores({
      rutaInicial: '/staff/validacion',
      sesionInicial: crearSesionPrueba('STAFF'),
    })

    expect(
      await screen.findByRole('heading', { name: /Validación de ingreso/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Código de ticket/i), 'TKT-8F2A1C')
    await user.click(screen.getByRole('button', { name: /Buscar/i }))

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Marcar como usado/i }))

    expect(
      await screen.findByText(/El ticket ya fue utilizado\. \(409\)/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-STF-003: validar ingreso con ticket inexistente muestra 404 visible', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/staff/validacion',
      sesionInicial: crearSesionPrueba('STAFF'),
    })

    expect(
      await screen.findByRole('heading', { name: /Validación de ingreso/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Código de ticket/i), 'TKT-NO-EXISTE')
    await user.click(screen.getByRole('button', { name: /Buscar/i }))

    expect(await screen.findByText(/Ticket no encontrado/i)).toBeInTheDocument()
  })

  it('TEST-FE-STF-004: tickets pagados de evento muestra tabla con filas', async () => {
    renderConProveedores({
      rutaInicial: '/staff/eventos/CMF-2026/tickets',
      sesionInicial: crearSesionPrueba('STAFF'),
    })

    expect(
      await screen.findByRole('heading', { name: /Tickets pagados · CMF-2026/i }),
    ).toBeInTheDocument()

    expect(await screen.findAllByText('TKT-8F2A1C')).not.toHaveLength(0)
    expect(screen.getAllByText('TKT-91B07D')).not.toHaveLength(0)
  })

  it('TEST-FE-ADM-001: crear evento con campos vacíos muestra errores y realiza 0 peticiones', async () => {
    const user = userEvent.setup()
    let llamadas = 0
    server.use(
      http.post('/api/events', () => {
        llamadas += 1
        return HttpResponse.json({}, { status: 201 })
      }),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })

    expect(
      await screen.findByRole('heading', { name: /Nuevo evento/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Crear evento/i }))

    expect(
      await screen.findByText(/El código del evento es obligatorio/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/El nombre del evento es obligatorio/i)).toBeInTheDocument()
    expect(llamadas).toBe(0)
  })

  it('TEST-FE-ADM-002: crear evento 201 navega a gestión', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })

    expect(
      await screen.findByRole('heading', { name: /Nuevo evento/i }),
    ).toBeInTheDocument()

    // Esperar a que carguen las sedes en el select
    expect(
      await screen.findByRole('option', { name: /Marina Convention Center/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Código del evento/i), 'CMF-2026')
    await user.type(screen.getByLabelText(/Nombre/i), 'Caribbean Music Fest 2026')
    await user.type(
      screen.getByLabelText(/Descripción/i),
      'Tres noches de música caribeña frente a la bahía.',
    )
    await user.type(screen.getByLabelText(/Fecha y hora/i), '2026-12-12T20:00')
    await user.selectOptions(screen.getByLabelText(/Sede/i), 'VEN-SMR-01')

    await user.click(screen.getByRole('button', { name: /Crear evento/i }))

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/admin/eventos/CMF-2026')
  })

  it('TEST-FE-ADM-003: crear evento 400 con details asigna errores a los campos', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json(
          {
            status: 400,
            error: 'Bad Request',
            message: 'Error de validación',
            details: {
              eventDate: 'La fecha del evento debe ser futura',
            },
          },
          { status: 400 },
        )
      }),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })

    expect(
      await screen.findByRole('option', { name: /Marina Convention Center/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Código del evento/i), 'CMF-2026')
    await user.type(screen.getByLabelText(/Nombre/i), 'Caribbean Music Fest 2026')
    await user.type(screen.getByLabelText(/Descripción/i), 'Descripción válida del evento.')
    await user.type(screen.getByLabelText(/Fecha y hora/i), '2026-12-12T20:00')
    await user.selectOptions(screen.getByLabelText(/Sede/i), 'VEN-SMR-01')

    await user.click(screen.getByRole('button', { name: /Crear evento/i }))

    expect(
      await screen.findByText(/La fecha del evento debe ser futura/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-ADM-004: publicar evento cambia badge a PUBLISHED', async () => {
    const user = userEvent.setup()
    let publicado = false

    server.use(
      http.get('/api/events/:eventCode', () => {
        return HttpResponse.json({
          ...EVENTOS_MOCK[0]!,
          status: publicado ? 'PUBLISHED' : 'DRAFT',
        })
      }),
      http.patch('/api/events/:eventCode/publish', () => {
        publicado = true
        return HttpResponse.json({
          ...EVENTOS_MOCK[0]!,
          status: 'PUBLISHED',
        })
      }),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/CMF-2026',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })

    expect(await screen.findByText('DRAFT')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Publicar evento/i }))
    await user.click(screen.getByRole('button', { name: /Confirmar publicación/i }))

    expect(await screen.findByText('PUBLISHED')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-005: publicar 409 muestra aviso de error', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/events/:eventCode', () => {
        return HttpResponse.json({
          ...EVENTOS_MOCK[0]!,
          status: 'DRAFT',
        })
      }),
      http.patch('/api/events/:eventCode/publish', () => {
        return HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El evento debe tener al menos un artista para publicarse.',
            details: {},
          },
          { status: 409 },
        )
      }),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/CMF-2026',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })

    expect(await screen.findByText('DRAFT')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Publicar evento/i }))
    await user.click(screen.getByRole('button', { name: /Confirmar publicación/i }))

    expect(
      await screen.findByText(/El evento debe tener al menos un artista para publicarse/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-ADM-006: asociar artista lo agrega a la lista y duplicado muestra 409', async () => {
    const user = userEvent.setup()
    let asociados = [ARTISTAS_MOCK[0]!]

    server.use(
      http.get('/api/events/:eventCode', () => {
        return HttpResponse.json({
          ...EVENTOS_MOCK[0]!,
          status: 'DRAFT',
          artists: asociados,
        })
      }),
      http.post('/api/events/:eventCode/artists/:artistId', ({ params }) => {
        const idNum = Number(params.artistId)
        if (idNum === 3) {
          return HttpResponse.json(
            {
              status: 409,
              error: 'Conflict',
              message: 'El artista ya está asociado al evento.',
              details: {},
            },
            { status: 409 },
          )
        }
        asociados = [...asociados, ARTISTAS_MOCK[1]!]
        return HttpResponse.json({
          ...EVENTOS_MOCK[0]!,
          status: 'DRAFT',
          artists: asociados,
        })
      }),
    )

    renderConProveedores({
      rutaInicial: '/admin/eventos/CMF-2026',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })

    expect(await screen.findByText('Solar Beat')).toBeInTheDocument()
    expect(
      await screen.findByRole('option', { name: 'Neon Waves' }),
    ).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/Agregar artista/i), '2')
    await user.click(screen.getByRole('button', { name: /Asociar/i }))

    expect(
      await screen.findByText(/Artista asociado al evento/i),
    ).toBeInTheDocument()

    // Probar respuesta 409 con artista 3
    await user.selectOptions(screen.getByLabelText(/Agregar artista/i), '3')
    await user.click(screen.getByRole('button', { name: /Asociar/i }))

    expect(
      await screen.findByText(/El artista ya está asociado al evento/i),
    ).toBeInTheDocument()
  })
})
