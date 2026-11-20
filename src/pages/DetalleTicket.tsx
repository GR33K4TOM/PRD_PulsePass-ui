import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import { IconoCopiar, IconoFlechaIzquierda } from '../componentes/Iconos'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import ModalConfirmarCancelacion from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { useCancelarTicket, useTicket } from '../funcionalidades/tickets/hooks'
import {
  obtenerNombreEventoTicket,
  obtenerTitularTicket,
} from '../funcionalidades/tickets/tipos'
import { formatearFechaHora } from '../lib/formato'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function DetalleTicket() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : undefined

  const [modalAbierto, setModalAbierto] = useState(false)
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const ticketQuery = useTicket(ticketCode)
  const cancelarMutation = useCancelarTicket(email)

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
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No pudimos encontrar el ticket solicitado o no pertenece a tu cuenta.
            </p>
            <Link
              to={RUTAS.misTickets}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
            >
              Volver a mis tickets
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

  const confirmarCancelacion = () => {
    setErrorCancelacion(null)
    cancelarMutation.mutate(ticket.ticketCode, {
      onSuccess: () => {
        setModalAbierto(false)
      },
      onError: (err) => {
        setErrorCancelacion(err.message)
      },
    })
  }

  const copiarCodigo = () => {
    void navigator.clipboard?.writeText(ticket.ticketCode)
    setCopiado(true)
    window.setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={RUTAS.misTickets}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
      >
        <IconoFlechaIzquierda className="h-4 w-4" />
        <span>Mis tickets</span>
      </Link>

      <Tarjeta className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-titulo text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {obtenerNombreEventoTicket(ticket)}
          </h1>
          <Badge tono={ticket.status}>{ticket.status}</Badge>
        </div>

        <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Código</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {ticket.ticketCode}
              </span>
              <button
                type="button"
                onClick={copiarCodigo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <IconoCopiar className="h-3.5 w-3.5" />
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
            </dd>
          </div>

          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Tipo</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              {ticket.type}
            </dd>
          </div>

          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Precio</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              <PrecioCOP valor={ticket.price} />
            </dd>
          </div>

          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Comprado el</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              {formatearFechaHora(ticket.purchaseDate)}
            </dd>
          </div>

          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Titular</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              {obtenerTitularTicket(ticket)}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Presenta este código en el ingreso.
        </p>
      </Tarjeta>

      {ticket.status === 'PAID' && (
        <div className="flex justify-end">
          <Boton
            variante="peligro"
            onClick={() => {
              setErrorCancelacion(null)
              setModalAbierto(true)
            }}
          >
            Cancelar ticket
          </Boton>
        </div>
      )}

      <ModalConfirmarCancelacion
        abierto={modalAbierto}
        ticket={ticket}
        onCerrar={() => setModalAbierto(false)}
        onConfirmar={confirmarCancelacion}
        cargando={cancelarMutation.isPending}
        errorMensaje={errorCancelacion}
      />
    </div>
  )
}
