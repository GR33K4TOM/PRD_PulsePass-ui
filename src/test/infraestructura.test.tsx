import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import PrecioCOP from '../componentes/PrecioCOP'
import {
  ApiError,
  establecerTokenHttp,
  peticionHttp,
  registrarManejador401,
} from '../lib/http'
import { server } from './setup'

describe('21.1 Infraestructura y utilidades', () => {
  it('TEST-FE-LIB-001: http añade Authorization Bearer cuando hay sesión', async () => {
    let headerRecibido: string | null = null
    server.use(
      http.get('/api/prueba-auth', ({ request }) => {
        headerRecibido = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )

    establecerTokenHttp('token-secreto-123')
    const res = await peticionHttp('/api/prueba-auth', z.object({ ok: z.boolean() }))

    expect(res.ok).toBe(true)
    expect(headerRecibido).toBe('Bearer token-secreto-123')
  })

  it('TEST-FE-LIB-002: http convierte ErrorResponse válido en ApiError con status y details', async () => {
    server.use(
      http.post('/api/prueba-error', () => {
        return HttpResponse.json(
          {
            timestamp: '2026-11-20T10:00:00Z',
            status: 400,
            error: 'Bad Request',
            message: 'Error de validación',
            details: { name: 'El nombre es obligatorio' },
          },
          { status: 400 },
        )
      }),
    )

    await expect(
      peticionHttp('/api/prueba-error', z.unknown(), { method: 'POST', body: {} }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Error de validación',
      details: { name: 'El nombre es obligatorio' },
    })
  })

  it('TEST-FE-LIB-003: http convierte cuerpo de error inválido en ApiError genérico', async () => {
    server.use(
      http.get('/api/prueba-500', () => {
        return new HttpResponse('Fallo interno sin JSON', { status: 500 })
      }),
    )

    try {
      await peticionHttp('/api/prueba-500', z.unknown())
      expect.fail('Debió lanzar ApiError')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      const apiErr = err as ApiError
      expect(apiErr.status).toBe(500)
      expect(apiErr.message).toBe('Ocurrió un error inesperado. Inténtalo más tarde.')
    }
  })

  it('TEST-FE-LIB-004: http 401 dispara cierre de sesión', async () => {
    const spy401 = vi.fn()
    registrarManejador401(spy401)

    server.use(
      http.get('/api/protegido', () => {
        return HttpResponse.json(
          { status: 401, message: 'Token expirado', details: {} },
          { status: 401 },
        )
      }),
    )

    await expect(peticionHttp('/api/protegido', z.unknown())).rejects.toThrow()
    expect(spy401).toHaveBeenCalledTimes(1)
  })

  it('TEST-FE-LIB-005: formato PrecioCOP formatea 250000 como COP', () => {
    render(<PrecioCOP valor={250000} />)
    expect(screen.getByText(/250\.000/)).toBeInTheDocument()
  })
})
