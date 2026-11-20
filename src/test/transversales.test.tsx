import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import ErrorPagina from '../pages/ErrorPagina'
import { crearSesionPrueba, renderConProveedores } from './utils'

describe('21.6 Transversales', () => {
  it('TEST-FE-GEN-001: ruta inexistente muestra página 404', async () => {
    renderConProveedores({ rutaInicial: '/ruta-que-no-existe-123' })

    expect(await screen.findByText('404')).toBeInTheDocument()
    expect(screen.getByText(/No encontramos esta página/i)).toBeInTheDocument()
  })

  it('TEST-FE-GEN-002: errorElement muestra mensaje seguro sin stack trace', async () => {
    const routerConFallo = createMemoryRouter(
      [
        {
          path: '/',
          loader: () => {
            throw new Error('Stack interno confidencial de base de datos')
          },
          Component: () => <div>Contenido</div>,
          ErrorBoundary: ErrorPagina,
          HydrateFallback: () => <div>Cargando...</div>,
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={routerConFallo} />)

    expect(
      await screen.findByRole('heading', { name: /¡Ups! Algo salió mal/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Ocurrió un error inesperado\. Inténtalo más tarde/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Stack interno confidencial/i),
    ).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-003: navbar muestra enlaces según rol', async () => {
    // Anónimo
    const { unmount: unmountAnon } = renderConProveedores({
      rutaInicial: '/',
      sesionInicial: { estado: 'anonimo' },
    })
    expect(screen.getByRole('link', { name: /Ingresar/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Mis tickets/i })).not.toBeInTheDocument()
    unmountAnon()

    // USER
    const { unmount: unmountUser } = renderConProveedores({
      rutaInicial: '/',
      sesionInicial: crearSesionPrueba('USER'),
    })
    expect(screen.getByRole('link', { name: /Mis tickets/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Administrar eventos/i }),
    ).not.toBeInTheDocument()
    unmountUser()

    // ADMIN
    renderConProveedores({
      rutaInicial: '/',
      sesionInicial: crearSesionPrueba('ADMIN'),
    })
    expect(
      screen.getByRole('link', { name: /Administrar eventos/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Validar ingreso/i })).toBeInTheDocument()
  })

  it('TEST-FE-GEN-004: menú móvil abre y cierra con teclado (Escape)', async () => {
    const user = userEvent.setup()
    renderConProveedores({ rutaInicial: '/' })

    const botonMenu = screen.getByRole('button', { name: /Abrir menú/i })
    await user.click(botonMenu)

    expect(screen.getByRole('navigation', { name: /Menú móvil/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('navigation', { name: /Menú móvil/i }),
    ).not.toBeInTheDocument()
  })
})
