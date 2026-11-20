import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelarTicketApi,
  comprarTicketApi,
  obtenerTicketPorCodigoApi,
  obtenerTicketsPagadosPorEventoApi,
  obtenerTicketsPorUsuarioApi,
  usarTicketApi,
} from './api'
import { obtenerCodigoEventoTicket, type PurchaseTicketRequest } from './tipos'

export function useTicket(ticketCode: string | undefined) {
  return useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: () => obtenerTicketPorCodigoApi(ticketCode ?? ''),
    enabled: Boolean(ticketCode),
    staleTime: 15 * 1000,
  })
}

export function useBuscarTicket(ticketCode: string | null) {
  return useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: () => obtenerTicketPorCodigoApi(ticketCode ?? ''),
    enabled: Boolean(ticketCode),
    staleTime: 0,
  })
}

export function useMisTickets(email: string | undefined) {
  return useQuery({
    queryKey: ['tickets', 'usuario', email],
    queryFn: () => obtenerTicketsPorUsuarioApi(email ?? ''),
    enabled: Boolean(email),
    staleTime: 15 * 1000,
  })
}

export function useTicketsPagadosPorEvento(eventCode: string | undefined) {
  return useQuery({
    queryKey: ['tickets', 'pagados', eventCode],
    queryFn: () => obtenerTicketsPagadosPorEventoApi(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: 15 * 1000,
  })
}

export function useComprarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PurchaseTicketRequest) => comprarTicketApi(payload),
    onSuccess: (ticket, variables) => {
      queryClient.setQueryData(['ticket', ticket.ticketCode], ticket)
      void queryClient.invalidateQueries({
        queryKey: ['tickets', 'usuario', variables.userEmail],
      })
      void queryClient.invalidateQueries({
        queryKey: ['evento', variables.eventCode],
      })
    },
  })
}

export function useCancelarTicket(emailUsuario?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => cancelarTicketApi(ticketCode),
    onSuccess: (actualizado) => {
      queryClient.setQueryData(['ticket', actualizado.ticketCode], actualizado)
      const email = emailUsuario ?? actualizado.userEmail ?? actualizado.user?.email
      if (email) {
        void queryClient.invalidateQueries({
          queryKey: ['tickets', 'usuario', email],
        })
      } else {
        void queryClient.invalidateQueries({
          queryKey: ['tickets', 'usuario'],
        })
      }
      void queryClient.invalidateQueries({
        queryKey: ['ticket', actualizado.ticketCode],
      })
      const eventCode = obtenerCodigoEventoTicket(actualizado)
      if (eventCode) {
        void queryClient.invalidateQueries({
          queryKey: ['tickets', 'pagados', eventCode],
        })
      }
    },
  })
}

export function useUsarTicket(eventCodeContexto?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => usarTicketApi(ticketCode),
    onSuccess: (actualizado) => {
      queryClient.setQueryData(['ticket', actualizado.ticketCode], actualizado)
      void queryClient.invalidateQueries({
        queryKey: ['ticket', actualizado.ticketCode],
      })
      const eventCode = eventCodeContexto ?? obtenerCodigoEventoTicket(actualizado)
      if (eventCode) {
        void queryClient.invalidateQueries({
          queryKey: ['tickets', 'pagados', eventCode],
        })
      } else {
        void queryClient.invalidateQueries({
          queryKey: ['tickets', 'pagados'],
        })
      }
    },
  })
}
