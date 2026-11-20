import { useState, type FormEvent } from 'react'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import { IconoBuscar } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import {
  useBuscarTicket,
  useUsarTicket,
} from '../funcionalidades/tickets/hooks'
import {
  obtenerNombreEventoTicket,
  obtenerTitularTicket,
} from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'

export default function ValidacionIngreso() {
  const [codigoEntrada, setCodigoEntrada] = useState('')
  const [codigoBuscado, setCodigoBuscado] = useState<string | null>(null)
  const [errorCampo, setErrorCampo] = useState<string | undefined>(undefined)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeErrorUso, setMensajeErrorUso] = useState<string | null>(null)

  const buscarQuery = useBuscarTicket(codigoBuscado)
  const usarMutation = useUsarTicket()

  const manejarBuscar = (e: FormEvent) => {
    e.preventDefault()
    const limpio = codigoEntrada.trim()
    if (!limpio) {
      setErrorCampo('Ingresa el código de ticket')
      return
    }
    setErrorCampo(undefined)
    setMensajeExito(null)
    setMensajeErrorUso(null)
    if (limpio === codigoBuscado) {
      void buscarQuery.refetch()
    } else {
      setCodigoBuscado(limpio)
    }
  }

  const manejarUsarTicket = () => {
    const ticket = buscarQuery.data
    if (!ticket) return
    setMensajeExito(null)
    setMensajeErrorUso(null)

    usarMutation.mutate(ticket.ticketCode, {
      onSuccess: () => {
        setMensajeExito('Ingreso registrado.')
        setCodigoEntrada('')
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          setMensajeErrorUso(`${err.message} (409)`)
        } else if (err instanceof ApiError && err.status === 403) {
          setMensajeErrorUso('Sin permisos.')
        } else {
          setMensajeErrorUso(err.message)
        }
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Validación de ingreso
      </h1>

      <form onSubmit={manejarBuscar} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Campo
            etiqueta="Código de ticket"
            placeholder="TKT-8F2A1C"
            autoFocus
            value={codigoEntrada}
            error={errorCampo}
            onChange={(e) => setCodigoEntrada(e.target.value)}
            className="font-mono"
          />
        </div>
        <Boton type="submit" variante="primario">
          <IconoBuscar className="h-4 w-4" />
          <span>Buscar</span>
        </Boton>
      </form>

      {buscarQuery.isPending && codigoBuscado && <Cargando cantidad={1} />}

      {buscarQuery.isError && (
        <Aviso tipo="error" rol="alert">
          {buscarQuery.error instanceof ApiError && buscarQuery.error.status === 404
            ? 'Ticket no encontrado'
            : buscarQuery.error instanceof ApiError && buscarQuery.error.status === 403
              ? 'Sin permisos'
              : buscarQuery.error.message}
        </Aviso>
      )}

      {buscarQuery.isSuccess && buscarQuery.data && (
        <Tarjeta className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
                {obtenerNombreEventoTicket(buscarQuery.data)}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {buscarQuery.data.type} · Titular: {obtenerTitularTicket(buscarQuery.data)}
              </p>
            </div>
            <Badge tono={buscarQuery.data.status}>{buscarQuery.data.status}</Badge>
          </div>

          <Boton
            variante="primario"
            cargando={usarMutation.isPending}
            onClick={manejarUsarTicket}
            className="w-full"
          >
            Marcar como usado
          </Boton>
        </Tarjeta>
      )}

      {mensajeExito && <Aviso tipo="exito">{mensajeExito}</Aviso>}
      {mensajeErrorUso && (
        <Aviso tipo="advertencia" rol="alert">
          {mensajeErrorUso}
        </Aviso>
      )}
    </div>
  )
}
