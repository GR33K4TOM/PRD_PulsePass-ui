import { peticionHttp } from '../../lib/http'
import { ArtistResponseSchema, ListaArtistasSchema, type ArtistResponse } from './tipos'

export function obtenerArtistasActivosApi(): Promise<ArtistResponse[]> {
  return peticionHttp('/api/artists/active', ListaArtistasSchema)
}

export function obtenerArtistaPorIdApi(id: number): Promise<ArtistResponse> {
  return peticionHttp(`/api/artists/${id}`, ArtistResponseSchema)
}

export function obtenerArtistaPorNombreApi(stageName: string): Promise<ArtistResponse> {
  return peticionHttp(
    `/api/artists/by-stage-name?stageName=${encodeURIComponent(stageName)}`,
    ArtistResponseSchema,
  )
}
