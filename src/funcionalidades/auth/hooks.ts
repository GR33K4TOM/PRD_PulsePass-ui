import { useMutation } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import type { LoginRequest } from './tipos'

export function useLogin() {
  const { iniciarSesion } = useAuth()
  return useMutation({
    mutationFn: (credenciales: LoginRequest) => iniciarSesion(credenciales),
  })
}

export function useSesion() {
  return useAuth()
}
