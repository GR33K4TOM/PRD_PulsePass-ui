import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import { IconoCheck } from '../componentes/Iconos'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { obtenerNombreEventoTicket } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function ConfirmacionCompra() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const ticketQuery = useTicket(ticketCode)

  if (ticketQuery.isPending) {
    return <Cargando cantidad={1} />
  }

  if (ticketQuery.isError) {
    const err = ticketQuery.error
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      return (
        <div className="mx-auto max-w-md py-12">
          <Tarjeta className="space-y-4 text-center">
            <h1 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
              Ticket no disponible
            </h1>
            <Link
              to={RUTAS.misTickets}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
            >
              Ver mis tickets
            </Link>
          </Tarjeta>
        </div>
      )
    }

    return (
      <EstadoError
        mensaje={err.message}
        onReintentar={() => {
          void ticketQuery.refetch()
        }}
      />
    )
  }

  const ticket = ticketQuery.data
  if (!ticket) return null

  return (
    <div className="mx-auto max-w-md py-10">
      <Tarjeta className="flex flex-col items-center space-y-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          <IconoCheck className="h-7 w-7" />
        </span>

        <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          ¡Compra realizada con éxito!
        </h1>

        <div className="space-y-1.5">
          <p className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
            {obtenerNombreEventoTicket(ticket)}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Ticket <span className="font-mono font-bold">{ticket.ticketCode}</span>
            {' · '}
            <span>{ticket.type}</span>
            {' · '}
            <PrecioCOP valor={ticket.price} />
          </p>
          <div className="pt-1">
            <Badge tono={ticket.status}>{ticket.status}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to={RUTAS.misTickets}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
          >
            Ver mis tickets
          </Link>
          <Link
            to={RUTAS.eventos}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Seguir explorando
          </Link>
        </div>
      </Tarjeta>
    </div>
  )
}
