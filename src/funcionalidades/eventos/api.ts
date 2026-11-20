import { peticionHttp } from '../../lib/http'
import {
  EventResponseSchema,
  ListaEventosSummarySchema,
  type CreateEventRequest,
  type EventResponse,
  type EventSummaryResponse,
} from './tipos'

export function obtenerEventosPublicadosApi(): Promise<EventSummaryResponse[]> {
  return peticionHttp('/api/events/published', ListaEventosSummarySchema)
}

export function obtenerEventoPorCodigoApi(eventCode: string): Promise<EventResponse> {
  return peticionHttp(`/api/events/${encodeURIComponent(eventCode)}`, EventResponseSchema)
}

export function obtenerEventosPorArtistaApi(stageName: string): Promise<EventSummaryResponse[]> {
  return peticionHttp(
    `/api/events/by-artist?stageName=${encodeURIComponent(stageName)}`,
    ListaEventosSummarySchema,
  )
}

export function crearEventoApi(payload: CreateEventRequest): Promise<EventResponse> {
  return peticionHttp('/api/events', EventResponseSchema, {
    method: 'POST',
    body: payload,
  })
}

export function publicarEventoApi(eventCode: string): Promise<EventResponse> {
  return peticionHttp(
    `/api/events/${encodeURIComponent(eventCode)}/publish`,
    EventResponseSchema,
    {
      method: 'PATCH',
    },
  )
}

export function asociarArtistaEventoApi(
  eventCode: string,
  artistId: number,
): Promise<EventResponse> {
  return peticionHttp(
    `/api/events/${encodeURIComponent(eventCode)}/artists/${artistId}`,
    EventResponseSchema,
    {
      method: 'POST',
    },
  )
}
