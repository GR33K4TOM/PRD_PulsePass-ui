import { useState } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import ModalConfirmarCancelacion from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import {
  useCancelarTicket,
  useMisTickets,
} from '../funcionalidades/tickets/hooks'
import {
  obtenerNombreEventoTicket,
  type TicketResponse,
  type TicketStatus,
} from '../funcionalidades/tickets/tipos'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

type FiltroTicket = 'TODOS' | TicketStatus

const CHIPS_FILTRO: { etiqueta: string; valor: FiltroTicket }[] = [
  { etiqueta: 'Todos', valor: 'TODOS' },
  { etiqueta: 'Pagados', valor: 'PAID' },
  { etiqueta: 'Usados', valor: 'USED' },
  { etiqueta: 'Cancelados', valor: 'CANCELLED' },
]

export default function MisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : undefined

  const [filtro, setFiltro] = useState<FiltroTicket>('TODOS')
  const [ticketACancelar, setTicketACancelar] = useState<TicketResponse | null>(null)
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null)

  const ticketsQuery = useMisTickets(email)
  const cancelarMutation = useCancelarTicket(email)

  if (ticketsQuery.isPending) {
    return <Cargando cantidad={3} />
  }

  if (ticketsQuery.isError) {
    return (
      <EstadoError
        mensaje={ticketsQuery.error.message}
        onReintentar={() => {
          void ticketsQuery.refetch()
        }}
      />
    )
  }

  const todosLosTickets = ticketsQuery.data ?? []
  const ticketsFiltrados =
    filtro === 'TODOS'
      ? todosLosTickets
      : todosLosTickets.filter((t) => t.status === filtro)

  const confirmarCancelacion = () => {
    if (!ticketACancelar) return
    setErrorCancelacion(null)
    cancelarMutation.mutate(ticketACancelar.ticketCode, {
      onSuccess: () => {
        setTicketACancelar(null)
      },
      onError: (err) => {
        setErrorCancelacion(err.message)
      },
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Mis tickets
      </h1>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        {CHIPS_FILTRO.map((chip) => {
          const activo = filtro === chip.valor
          return (
            <button
              key={chip.valor}
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltro(chip.valor)}
              className={clsx(
                'rounded-full px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
                activo
                  ? 'bg-marca-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
              )}
            >
              {chip.etiqueta}
            </button>
          )
        })}
      </div>

      {todosLosTickets.length === 0 ? (
        <EstadoVacio
          mensaje="Aún no tienes tickets"
          accion={
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
            >
              Ver cartelera
            </Link>
          }
        />
      ) : ticketsFiltrados.length === 0 ? (
        <EstadoVacio mensaje="No hay tickets con este estado" />
      ) : (
        <div className="space-y-4">
          {ticketsFiltrados.map((ticket) => (
            <Tarjeta
              key={ticket.ticketCode}
              className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
                    {obtenerNombreEventoTicket(ticket)}
                  </h2>
                  <Badge tono={ticket.status}>{ticket.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono font-semibold">{ticket.ticketCode}</span>
                  {' · '}
                  <span>{ticket.type}</span>
                  {' · '}
                  <PrecioCOP valor={ticket.price} />
                  {' · '}
                  <span>{formatearFecha(ticket.purchaseDate)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  to={RUTAS.detalleTicket(ticket.ticketCode)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  Ver detalle
                </Link>

                {ticket.status === 'PAID' && (
                  <Boton
                    variante="peligro"
                    onClick={() => {
                      setErrorCancelacion(null)
                      setTicketACancelar(ticket)
                    }}
                  >
                    Cancelar
                  </Boton>
                )}
              </div>
            </Tarjeta>
          ))}
        </div>
      )}

      <ModalConfirmarCancelacion
        abierto={Boolean(ticketACancelar)}
        ticket={ticketACancelar}
        onCerrar={() => setTicketACancelar(null)}
        onConfirmar={confirmarCancelacion}
        cargando={cancelarMutation.isPending}
        errorMensaje={errorCancelacion}
      />
    </div>
  )
}
