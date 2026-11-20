import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import clsx from 'clsx'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import {
  IconoCalendario,
  IconoCultura,
  IconoFlechaIzquierda,
  IconoUsuario,
} from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { ESTILOS_CATEGORIA } from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEvento } from '../funcionalidades/eventos/hooks'
import ModalConfirmarCompra from '../funcionalidades/tickets/componentes/ModalConfirmarCompra'
import { useComprarTicket } from '../funcionalidades/tickets/hooks'
import { TicketTypeSchema, type TicketType } from '../funcionalidades/tickets/tipos'
import { formatearFechaHora } from '../lib/formato'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const TIPOS_ENTRADA = TicketTypeSchema.options

export default function DetalleEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const { sesion, tieneRol } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tipoSeleccionado, setTipoSeleccionado] = useState<TicketType>('GENERAL')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [errorCompra, setErrorCompra] = useState<string | null>(null)

  const eventoQuery = useEvento(eventCode)
  const comprarMutation = useComprarTicket()

  if (eventoQuery.isPending) {
    return <Cargando cantidad={2} />
  }

  if (eventoQuery.isError) {
    const err = eventoQuery.error
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      return (
        <div className="mx-auto max-w-md py-12">
          <Tarjeta className="space-y-4 text-center">
            <h1 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
              Evento no disponible
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              El evento que buscas no existe o no está publicado actualmente.
            </p>
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
            >
              Volver a la cartelera
            </Link>
          </Tarjeta>
        </div>
      )
    }

    return (
      <EstadoError
        mensaje={err.message}
        onReintentar={() => {
          void eventoQuery.refetch()
        }}
      />
    )
  }

  const evento = eventoQuery.data
  if (!evento) return null

  const visual = ESTILOS_CATEGORIA[evento.category]
  const disponibleParaCompra = evento.status === 'PUBLISHED'
  const esStaffOAdminSinUser =
    sesion.estado === 'autenticado' &&
    tieneRol('STAFF', 'ADMIN') &&
    !tieneRol('USER')

  const nombreSede = evento.venue?.name ?? evento.venueName ?? evento.venueCode ?? 'Sede'
  const ciudadSede = evento.venue?.city ?? evento.venueCity ?? evento.city ?? 'Santa Marta'
  const capacidadSede = evento.venue?.capacity ?? evento.venueCapacity
  const codigoSede = evento.venue?.code ?? evento.venueCode

  const manejarAccionCompra = () => {
    if (sesion.estado !== 'autenticado') {
      void navigate(RUTAS.login, { state: { desde: location.pathname } })
      return
    }
    setErrorCompra(null)
    setModalAbierto(true)
  }

  const confirmarCompra = () => {
    if (sesion.estado !== 'autenticado') return
    setErrorCompra(null)

    comprarMutation.mutate(
      {
        userEmail: sesion.usuario.email,
        eventCode: evento.eventCode,
        type: tipoSeleccionado,
      },
      {
        onSuccess: (ticketCreado) => {
          setModalAbierto(false)
          void navigate(RUTAS.confirmacionCompra(ticketCreado.ticketCode))
        },
        onError: (err) => {
          setErrorCompra(err.message)
        },
      },
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Link
        to={RUTAS.eventos}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
      >
        <IconoFlechaIzquierda className="h-4 w-4" />
        <span>Volver a la cartelera</span>
      </Link>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Tarjeta className="overflow-hidden p-0 lg:col-span-2">
          <div
            className={clsx(
              'flex h-48 items-center justify-center',
              visual.fondo,
            )}
          >
            {visual.icono}
          </div>

          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    'text-xs font-bold tracking-wider uppercase',
                    visual.texto,
                  )}
                >
                  {evento.category}
                </span>
                <Badge tono={evento.status}>{evento.status}</Badge>
              </div>
              <h1 className="font-titulo text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-slate-100">
                {evento.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <IconoCalendario className="h-4 w-4" />
                  <span>{formatearFechaHora(evento.eventDate)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <IconoUsuario className="h-4 w-4" />
                  <span>Edad mínima: {evento.minimumAge}</span>
                </span>
              </div>
            </div>

            {evento.description && (
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {evento.description}
              </p>
            )}

            <div className="space-y-3">
              <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
                Artistas
              </h2>
              {evento.artists.length === 0 ? (
                <p className="text-xs text-slate-500">Por confirmar</p>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  {evento.artists.map((artista, idx) => (
                    <AvatarArtista
                      key={artista.id ?? artista.stageName}
                      artista={artista}
                      indice={idx}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
                Sede
              </h2>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marca-50 text-marca-600 dark:bg-slate-800 dark:text-marca-500">
                  <IconoCultura className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  {codigoSede ? (
                    <Link
                      to={RUTAS.sede(codigoSede)}
                      className="font-semibold text-slate-900 hover:text-marca-600 dark:text-slate-100"
                    >
                      {nombreSede}
                    </Link>
                  ) : (
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {nombreSede}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {ciudadSede}
                    {capacidadSede !== undefined ? ` · Capacidad ${capacidadSede}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Tarjeta>

        {!esStaffOAdminSinUser && (
          <Tarjeta className="space-y-4">
            <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
              Entradas
            </h2>

            <fieldset className="space-y-2" disabled={!disponibleParaCompra}>
              <legend className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Tipo de entrada
              </legend>
              {TIPOS_ENTRADA.map((tipo) => {
                const activo = tipoSeleccionado === tipo
                return (
                  <label
                    key={tipo}
                    className={clsx(
                      'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors',
                      activo
                        ? 'border-marca-600 bg-marca-50/70 text-marca-700 dark:border-marca-500 dark:bg-slate-800 dark:text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="tipoEntrada"
                      value={tipo}
                      checked={activo}
                      onChange={() => setTipoSeleccionado(tipo)}
                      className="accent-marca-600"
                    />
                    <span>{tipo}</span>
                  </label>
                )
              })}
            </fieldset>

            {!disponibleParaCompra ? (
              <Aviso tipo="advertencia">
                La compra no está disponible ({evento.status}).
              </Aviso>
            ) : null}

            <Boton
              variante="primario"
              disabled={!disponibleParaCompra}
              onClick={manejarAccionCompra}
              className="w-full"
            >
              {sesion.estado === 'autenticado'
                ? 'Comprar entrada'
                : 'Inicia sesión para comprar'}
            </Boton>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              El precio lo define el sistema al confirmar.
            </p>
          </Tarjeta>
        )}
      </div>

      {!esStaffOAdminSinUser && disponibleParaCompra && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white p-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <Boton
            variante="primario"
            onClick={manejarAccionCompra}
            className="w-full"
          >
            {sesion.estado === 'autenticado'
              ? 'Comprar entrada'
              : 'Inicia sesión para comprar'}
          </Boton>
        </div>
      )}

      {sesion.estado === 'autenticado' && (
        <ModalConfirmarCompra
          abierto={modalAbierto}
          onCerrar={() => setModalAbierto(false)}
          onConfirmar={confirmarCompra}
          cargando={comprarMutation.isPending}
          nombreEvento={evento.name}
          tipoTicket={tipoSeleccionado}
          emailCuenta={sesion.usuario.email}
          errorMensaje={errorCompra}
        />
      )}
    </div>
  )
}
