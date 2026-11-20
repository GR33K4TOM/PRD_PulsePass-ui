import { peticionHttp } from '../../lib/http'
import {
  AuthenticatedUserResponseSchema,
  AuthResponseSchema,
  type AuthResponse,
  type LoginRequest,
  type UsuarioAutenticado,
} from './tipos'

export function loginApi(credenciales: LoginRequest): Promise<AuthResponse> {
  return peticionHttp('/api/auth/login', AuthResponseSchema, {
    method: 'POST',
    body: credenciales,
    omitirManejador401: true,
  })
}

export function obtenerSesionActualApi(): Promise<UsuarioAutenticado> {
  return peticionHttp('/api/auth/me', AuthenticatedUserResponseSchema)
}
