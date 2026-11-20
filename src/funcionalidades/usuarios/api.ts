import { peticionHttp } from '../../lib/http'
import { UserResponseSchema, type RegisterUserRequest, type UserResponse } from './tipos'

export function registrarUsuarioApi(payload: RegisterUserRequest): Promise<UserResponse> {
  return peticionHttp('/api/users', UserResponseSchema, {
    method: 'POST',
    body: payload,
  })
}

export function obtenerUsuarioPorEmailApi(email: string): Promise<UserResponse> {
  return peticionHttp(
    `/api/users/by-email?email=${encodeURIComponent(email)}`,
    UserResponseSchema,
  )
}

export function obtenerUsuarioPorUsernameApi(username: string): Promise<UserResponse> {
  return peticionHttp(
    `/api/users/by-username?username=${encodeURIComponent(username)}`,
    UserResponseSchema,
  )
}
