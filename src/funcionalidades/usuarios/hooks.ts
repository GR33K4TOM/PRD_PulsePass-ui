import { useMutation, useQuery } from '@tanstack/react-query'
import {
  obtenerUsuarioPorEmailApi,
  obtenerUsuarioPorUsernameApi,
  registrarUsuarioApi,
} from './api'
import type { RegisterUserRequest } from './tipos'

export function useRegistrarUsuario() {
  return useMutation({
    mutationFn: (payload: RegisterUserRequest) => registrarUsuarioApi(payload),
  })
}

export function useUsuarioPorEmail(email: string | undefined) {
  return useQuery({
    queryKey: ['usuario', email],
    queryFn: () => obtenerUsuarioPorEmailApi(email ?? ''),
    enabled: Boolean(email),
    staleTime: 60 * 1000,
  })
}

export function useUsuarioPorUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['usuario', 'username', username],
    queryFn: () => obtenerUsuarioPorUsernameApi(username ?? ''),
    enabled: Boolean(username),
    staleTime: 60 * 1000,
  })
}
