import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from './setup'
import { crearSesionPrueba, renderConProveedores } from './utils'

describe('21.4 Tickets', () => {
  it('TEST-FE-TKT-001 y TEST-FE-TKT-004: compra válida envía email de la sesión y navega a confirmación', async () => {
    const user = userEvent.setup()
    let payloadEnviado: { userEmail?: string; eventCode?: string; type?: string } | null = null

    server.use(
      http.post('/api/tickets', async ({ request }) => {
        payloadEnviado = (await request.json()) as {
          userEmail: string
          eventCode: string
          type: string
        }
        return HttpResponse.json(
          {
            ticketCode: 'TKT-8F2A1C',
            type: payloadEnviado.type,
            price: 250000,
            status: 'PAID',
            purchaseDate: '2026-11-20T10:00:00',
            userEmail: payloadEnviado.userEmail,
            eventCode: payloadEnviado.eventCode,
            eventName: 'Caribbean Music Fest 2026',
          },
          { status: 201 },
        )
      }),
    )

    const { router } = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      sesionInicial: crearSesionPrueba('USER', { email: 'andrea@pulsepass.test' }),
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /VIP/i }))
    const botonesComprar = screen.getAllByRole('button', { name: /Comprar entrada/i })
    await user.click(botonesComprar[0]!)

    const modal = await screen.findByRole('dialog')
    expect(within(modal).getByText('andrea@pulsepass.test')).toBeInTheDocument()

    await user.click(within(modal).getByRole('button', { name: /Confirmar/i }))

    expect(
      await screen.findByRole('heading', { name: /¡Compra realizada con éxito!/i }),
    ).toBeInTheDocument()
    expect(payloadEnviado).toEqual({
      userEmail: 'andrea@pulsepass.test',
      eventCode: 'CMF-2026',
      type: 'VIP',
    })
    expect(router.state.location.pathname).toBe('/compra/confirmacion/TKT-8F2A1C')
  })

  it('TEST-FE-TKT-002: compra anónima redirige a login con state.desde', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      sesionInicial: { estado: 'anonimo' },
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()

    const botones = screen.getAllByRole('button', { name: /Inicia sesión para comprar/i })
    await user.click(botones[0]!)

    expect(await screen.findByRole('heading', { name: /Inicia sesión/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect((router.state.location.state as { desde?: string })?.desde).toBe(
      '/eventos/CMF-2026',
    )
  })

  it('TEST-FE-TKT-003: compra 409 muestra mensaje del backend en el modal sin cerrarlo', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('/api/tickets', () => {
        return HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El usuario no cumple la edad mínima del evento.',
            details: {},
          },
          { status: 409 },
        )
      }),
    )

    renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      sesionInicial: crearSesionPrueba('USER', { email: 'laura@pulsepass.test' }),
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()

    const botonesComprar = screen.getAllByRole('button', { name: /Comprar entrada/i })
    await user.click(botonesComprar[0]!)

    const modal = await screen.findByRole('dialog')
    await user.click(within(modal).getByRole('button', { name: /Confirmar/i }))

    expect(
      await within(modal).findByText(/El usuario no cumple la edad mínima del evento/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-TKT-005 y TEST-FE-TKT-010: mis tickets lista, filtra por estado y oculta cancelar si status != PAID', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('Noche de Jazz y Cultura')).toBeInTheDocument()

    // Solo hay 1 botón Cancelar (para el ticket PAID, el USED no lo tiene)
    const botonesCancelar = screen.getAllByRole('button', { name: /^Cancelar$/i })
    expect(botonesCancelar).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /Usados/i }))
    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Noche de Jazz y Cultura')).toBeInTheDocument()
  })

  it('TEST-FE-TKT-006: mis tickets vacío muestra estado vacío', async () => {
    server.use(
      http.get('/api/tickets/by-user', () => {
        return HttpResponse.json([])
      }),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(await screen.findByText(/Aún no tienes tickets/i)).toBeInTheDocument()
  })

  it('TEST-FE-TKT-007: cancelar PAID responde 200 y actualiza la lista', async () => {
    const user = userEvent.setup()
    let cancelado = false

    server.use(
      http.get('/api/tickets/by-user', () => {
        return HttpResponse.json([
          {
            ticketCode: 'TKT-8F2A1C',
            type: 'VIP',
            price: 250000,
            status: cancelado ? 'CANCELLED' : 'PAID',
            purchaseDate: '2026-11-05T14:32:00',
            userEmail: 'andrea@pulsepass.test',
            eventCode: 'CMF-2026',
            eventName: 'Caribbean Music Fest 2026',
          },
        ])
      }),
      http.patch('/api/tickets/:ticketCode/cancel', () => {
        cancelado = true
        return HttpResponse.json({
          ticketCode: 'TKT-8F2A1C',
          type: 'VIP',
          price: 250000,
          status: 'CANCELLED',
          purchaseDate: '2026-11-05T14:32:00',
          userEmail: 'andrea@pulsepass.test',
          eventCode: 'CMF-2026',
          eventName: 'Caribbean Music Fest 2026',
        })
      }),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(await screen.findByText('PAID')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Cancelar$/i }))

    const modal = await screen.findByRole('dialog')
    await user.click(within(modal).getByRole('button', { name: /Cancelar ticket/i }))

    expect(await screen.findByText('CANCELLED')).toBeInTheDocument()
  })

  it('TEST-FE-TKT-008: cancelar 409 muestra mensaje y mantiene el modal abierto', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch('/api/tickets/:ticketCode/cancel', () => {
        return HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El ticket no puede cancelarse en su estado actual.',
            details: {},
          },
          { status: 409 },
        )
      }),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Cancelar$/i }))

    const modal = await screen.findByRole('dialog')
    await user.click(within(modal).getByRole('button', { name: /Cancelar ticket/i }))

    expect(
      await within(modal).findByText(/El ticket no puede cancelarse en su estado actual/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-TKT-009: ticket ajeno 403/404 muestra "Ticket no disponible"', async () => {
    server.use(
      http.get('/api/tickets/:ticketCode', () => {
        return HttpResponse.json(
          { status: 403, message: 'Forbidden', details: {} },
          { status: 403 },
        )
      }),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets/TKT-91B07D',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(
      await screen.findByRole('heading', { name: /Ticket no disponible/i }),
    ).toBeInTheDocument()
  })
})
