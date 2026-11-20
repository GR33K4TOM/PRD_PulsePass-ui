import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  asociarArtistaEventoApi,
  crearEventoApi,
  obtenerEventoPorCodigoApi,
  obtenerEventosPorArtistaApi,
  obtenerEventosPublicadosApi,
  publicarEventoApi,
} from './api'
import type { CreateEventRequest, EventResponse } from './tipos'

let eventosCreadosEnSesion: EventResponse[] = []

export function obtenerEventosCreadosSesion(): EventResponse[] {
  return eventosCreadosEnSesion
}

export function registrarEventoEnSesion(evento: EventResponse): void {
  const filtrados = eventosCreadosEnSesion.filter((e) => e.eventCode !== evento.eventCode)
  eventosCreadosEnSesion = [evento, ...filtrados]
}

export function limpiarEventosCreadosSesion(): void {
  eventosCreadosEnSesion = []
}

export function useEventosPublicados() {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: obtenerEventosPublicadosApi,
    staleTime: 60 * 1000,
  })
}

export function useEvento(eventCode: string | undefined) {
  return useQuery({
    queryKey: ['evento', eventCode],
    queryFn: () => obtenerEventoPorCodigoApi(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: 30 * 1000,
  })
}

export function useEventosPorArtista(stageName: string | undefined) {
  return useQuery({
    queryKey: ['eventos', 'artista', stageName],
    queryFn: () => obtenerEventosPorArtistaApi(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: 60 * 1000,
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventRequest) => crearEventoApi(payload),
    onSuccess: (creado) => {
      registrarEventoEnSesion(creado)
      queryClient.setQueryData(['evento', creado.eventCode], creado)
      void queryClient.invalidateQueries({ queryKey: ['evento', creado.eventCode] })
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventCode: string) => publicarEventoApi(eventCode),
    onSuccess: (actualizado) => {
      registrarEventoEnSesion(actualizado)
      queryClient.setQueryData(['evento', actualizado.eventCode], actualizado)
      void queryClient.invalidateQueries({ queryKey: ['evento', actualizado.eventCode] })
      void queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] })
    },
  })
}

export function useAsociarArtista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventCode,
      artistId,
    }: {
      eventCode: string
      artistId: number
      stageName?: string
    }) => asociarArtistaEventoApi(eventCode, artistId),
    onSuccess: (actualizado, variables) => {
      registrarEventoEnSesion(actualizado)
      queryClient.setQueryData(['evento', actualizado.eventCode], actualizado)
      void queryClient.invalidateQueries({ queryKey: ['evento', actualizado.eventCode] })
      if (variables.stageName) {
        void queryClient.invalidateQueries({
          queryKey: ['eventos', 'artista', variables.stageName],
        })
      } else {
        void queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] })
      }
    },
  })
}
