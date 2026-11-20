import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from './setup'
import { crearSesionPrueba, renderConProveedores } from './utils'

describe('21.3 Catálogo, artistas y sedes', () => {
  it('TEST-FE-EVT-001: cartelera lista eventos publicados', async () => {
    renderConProveedores({ rutaInicial: '/eventos' })

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('Cumbre Tech Caribe 2027')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-002: cartelera con lista vacía muestra estado vacío', async () => {
    server.use(
      http.get('/api/events/published', () => {
        return HttpResponse.json([])
      }),
    )

    renderConProveedores({ rutaInicial: '/eventos' })

    expect(
      await screen.findByText(/Aún no hay eventos publicados/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-EVT-003: cartelera filtra por texto y categoría actualizando la URL', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({ rutaInicial: '/eventos' })

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Buscar por nombre/i), 'Cumbre')
    expect(router.state.location.search).toContain('q=Cumbre')
    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Cumbre Tech Caribe 2027')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/Categoría/i), 'MUSIC')
    expect(router.state.location.search).toContain('categoria=MUSIC')
    expect(
      await screen.findByText(/Sin resultados para tu búsqueda/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-EVT-004: detalle muestra evento, artistas y sede', async () => {
    renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Edad mínima: 18/i)).toBeInTheDocument()
    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()
    expect(screen.getByText('Marina Convention Center')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-005: detalle 404 muestra "Evento no disponible"', async () => {
    renderConProveedores({ rutaInicial: '/eventos/NO-EXISTE' })

    expect(
      await screen.findByRole('heading', { name: /Evento no disponible/i }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-EVT-006: detalle de evento SOLD_OUT tiene compra deshabilitada', async () => {
    renderConProveedores({
      rutaInicial: '/eventos/CTC-2027',
      sesionInicial: crearSesionPrueba('USER'),
    })

    expect(
      await screen.findByRole('heading', { name: 'Cumbre Tech Caribe 2027' }),
    ).toBeInTheDocument()

    const botonCompra = screen.getByRole('button', { name: /Comprar entrada/i })
    expect(botonCompra).toBeDisabled()
  })

  it('TEST-FE-ART-001: lista de artistas activos', async () => {
    renderConProveedores({ rutaInicial: '/artistas' })

    expect(await screen.findByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()
    expect(screen.getByText('Caribbean Sound')).toBeInTheDocument()
  })

  it('TEST-FE-ART-002: detalle de artista con eventos asociados', async () => {
    renderConProveedores({ rutaInicial: '/artistas/1' })

    expect(
      await screen.findByRole('heading', { name: 'Solar Beat' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Caribbean Music Fest 2026'),
    ).toBeInTheDocument()
  })

  it('TEST-FE-ART-003: id no numérico muestra 404 sin llamar a la API', async () => {
    let llamadas = 0
    server.use(
      http.get('/api/artists/:id', () => {
        llamadas += 1
        return HttpResponse.json({})
      }),
    )

    renderConProveedores({ rutaInicial: '/artistas/abc' })

    expect(await screen.findByText('404')).toBeInTheDocument()
    expect(llamadas).toBe(0)
  })

  it('TEST-FE-VEN-001: lista y detalle de sede; 404 de sede', async () => {
    renderConProveedores({ rutaInicial: '/sedes' })
    expect(await screen.findByText('Marina Convention Center')).toBeInTheDocument()

    renderConProveedores({ rutaInicial: '/sedes/VEN-SMR-01' })
    expect(await screen.findByText('VEN-SMR-01')).toBeInTheDocument()
    expect(screen.getByText(/3 personas/i)).toBeInTheDocument()

    renderConProveedores({ rutaInicial: '/sedes/SEDE-INEXISTENTE' })
    expect(await screen.findByText('404')).toBeInTheDocument()
  })
})
