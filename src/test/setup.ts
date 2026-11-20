import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { limpiarEventosCreadosSesion } from '../funcionalidades/eventos/hooks'
import { establecerTokenHttp, registrarManejador401 } from '../lib/http'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  sessionStorage.clear()
  establecerTokenHttp(null)
  registrarManejador401(null)
  limpiarEventosCreadosSesion()
})

afterAll(() => {
  server.close()
})
