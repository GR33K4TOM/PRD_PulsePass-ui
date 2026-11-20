import { z } from 'zod'

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

export const TicketResponseSchema = z
  .object({
    ticketCode: z.string(),
    type: TicketTypeSchema,
    price: z.number(),
    status: TicketStatusSchema,
    purchaseDate: z.string(),
    userEmail: z.string().optional(),
    userFullName: z.string().optional(),
    userName: z.string().optional(),
    eventCode: z.string().optional(),
    eventName: z.string().optional(),
    user: z
      .object({
        email: z.string().optional(),
        username: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        fullName: z.string().optional(),
      })
      .passthrough()
      .optional(),
    event: z
      .object({
        eventCode: z.string().optional(),
        name: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

export type TicketResponse = z.infer<typeof TicketResponseSchema>
export const ListaTicketsSchema = z.array(TicketResponseSchema)

export const PurchaseTicketRequestSchema = z.object({
  userEmail: z.string().email(),
  eventCode: z.string().min(1),
  type: TicketTypeSchema,
})

export type PurchaseTicketRequest = z.infer<typeof PurchaseTicketRequestSchema>

export function obtenerNombreEventoTicket(ticket: TicketResponse): string {
  return ticket.eventName ?? ticket.event?.name ?? ticket.eventCode ?? ticket.event?.eventCode ?? 'Evento'
}

export function obtenerCodigoEventoTicket(ticket: TicketResponse): string {
  return ticket.eventCode ?? ticket.event?.eventCode ?? ''
}

export function obtenerTitularTicket(ticket: TicketResponse): string {
  if (ticket.userFullName) return ticket.userFullName
  if (ticket.user?.fullName) return ticket.user.fullName
  if (ticket.user?.firstName || ticket.user?.lastName) {
    return `${ticket.user.firstName ?? ''} ${ticket.user.lastName ?? ''}`.trim()
  }
  return ticket.userName ?? ticket.user?.username ?? ticket.userEmail ?? ticket.user?.email ?? 'Titular'
}
