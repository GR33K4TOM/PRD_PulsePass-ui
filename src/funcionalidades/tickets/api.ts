import { peticionHttp } from '../../lib/http'
import {
  ListaTicketsSchema,
  TicketResponseSchema,
  type PurchaseTicketRequest,
  type TicketResponse,
} from './tipos'

export function comprarTicketApi(payload: PurchaseTicketRequest): Promise<TicketResponse> {
  return peticionHttp('/api/tickets', TicketResponseSchema, {
    method: 'POST',
    body: payload,
  })
}

export function obtenerTicketPorCodigoApi(ticketCode: string): Promise<TicketResponse> {
  return peticionHttp(
    `/api/tickets/${encodeURIComponent(ticketCode)}`,
    TicketResponseSchema,
  )
}

export function obtenerTicketsPorUsuarioApi(email: string): Promise<TicketResponse[]> {
  return peticionHttp(
    `/api/tickets/by-user?email=${encodeURIComponent(email)}`,
    ListaTicketsSchema,
  )
}

export function obtenerTicketsPagadosPorEventoApi(eventCode: string): Promise<TicketResponse[]> {
  return peticionHttp(
    `/api/events/${encodeURIComponent(eventCode)}/tickets/paid`,
    ListaTicketsSchema,
  )
}

export function cancelarTicketApi(ticketCode: string): Promise<TicketResponse> {
  return peticionHttp(
    `/api/tickets/${encodeURIComponent(ticketCode)}/cancel`,
    TicketResponseSchema,
    {
      method: 'PATCH',
    },
  )
}

export function usarTicketApi(ticketCode: string): Promise<TicketResponse> {
  return peticionHttp(
    `/api/tickets/${encodeURIComponent(ticketCode)}/use`,
    TicketResponseSchema,
    {
      method: 'PATCH',
    },
  )
}
