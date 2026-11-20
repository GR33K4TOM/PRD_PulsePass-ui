import { useQuery } from '@tanstack/react-query'
import { obtenerSedePorCodigoApi, obtenerSedesActivasApi } from './api'

export function useSedesActivas() {
  return useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: obtenerSedesActivasApi,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSede(code: string | undefined) {
  return useQuery({
    queryKey: ['sede', code],
    queryFn: () => obtenerSedePorCodigoApi(code ?? ''),
    enabled: Boolean(code),
    staleTime: 5 * 60 * 1000,
  })
}
