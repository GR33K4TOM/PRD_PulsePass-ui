import { useQuery } from '@tanstack/react-query'
import {
  obtenerArtistaPorIdApi,
  obtenerArtistaPorNombreApi,
  obtenerArtistasActivosApi,
} from './api'

export function useArtistasActivos() {
  return useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: obtenerArtistasActivosApi,
    staleTime: 5 * 60 * 1000,
  })
}

export function useArtista(id: number | null) {
  return useQuery({
    queryKey: ['artista', id],
    queryFn: () => obtenerArtistaPorIdApi(id ?? 0),
    enabled: id !== null && !Number.isNaN(id),
    staleTime: 5 * 60 * 1000,
  })
}

export function useArtistaPorNombre(stageName: string | undefined) {
  return useQuery({
    queryKey: ['artista', 'nombre', stageName],
    queryFn: () => obtenerArtistaPorNombreApi(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: 5 * 60 * 1000,
  })
}
