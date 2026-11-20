import { useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import {
  IconoFlechaDerecha,
  IconoFlechaIzquierda,
  IconoMas,
} from '../componentes/Iconos'
import Modal from '../componentes/Modal'
import Selector from '../componentes/Selector'
import Tarjeta from '../componentes/Tarjeta'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import {
  useAsociarArtista,
  useEvento,
  usePublicarEvento,
} from '../funcionalidades/eventos/hooks'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function AdminGestionEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const location = useLocation()
  const recienCreado = Boolean((location.state as { creado?: boolean } | null)?.creado)

  const [modalPublicar, setModalPublicar] = useState(false)
  const [artistaIdSeleccionado, setArtistaIdSeleccionado] = useState('')
  const [aviso, setAviso] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(
    recienCreado ? { tipo: 'exito', texto: 'Evento creado correctamente.' } : null,
  )

  const eventoQuery = useEvento(eventCode)
  const artistasQuery = useArtistasActivos()
  const publicarMutation = usePublicarEvento()
  const asociarMutation = useAsociarArtista()

  if (eventoQuery.isPending) {
    return <Cargando cantidad={2} />
  }

  if (eventoQuery.isError) {
    return (
      <EstadoError
        mensaje={eventoQuery.error.message}
        onReintentar={() => {
          void eventoQuery.refetch()
        }}
      />
    )
  }

  const evento = eventoQuery.data
  if (!evento) return null

  const nombresAsociados = new Set(evento.artists.map((a) => a.stageName))
  const idsAsociados = new Set(evento.artists.map((a) => a.id))

  const confirmarPublicacion = () => {
    setAviso(null)
    publicarMutation.mutate(evento.eventCode, {
      onSuccess: () => {
        setModalPublicar(false)
        setAviso({ tipo: 'exito', texto: 'Evento publicado con éxito.' })
      },
      onError: (err) => {
        setModalPublicar(false)
        setAviso({ tipo: 'error', texto: err.message })
      },
    })
  }

  const manejarAsociarArtista = (e: FormEvent) => {
    e.preventDefault()
    if (!artistaIdSeleccionado) return
    const idNum = Number(artistaIdSeleccionado)
    if (Number.isNaN(idNum)) return

    const artistaObj = artistasQuery.data?.find((a) => a.id === idNum)
    setAviso(null)
    asociarMutation.mutate(
      {
        eventCode: evento.eventCode,
        artistId: idNum,
        stageName: artistaObj?.stageName,
      },
      {
        onSuccess: () => {
          setArtistaIdSeleccionado('')
          setAviso({ tipo: 'exito', texto: 'Artista asociado al evento.' })
        },
        onError: (err) => {
          setAviso({ tipo: 'error', texto: err.message })
        },
      },
    )
  }

  const nombreSede =
    evento.venue?.name ?? evento.venueName ?? evento.venueCode ?? 'Sede'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to={RUTAS.adminEventos}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
      >
        <IconoFlechaIzquierda className="h-4 w-4" />
        <span>Eventos</span>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {evento.name}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold">{evento.eventCode}</span>
            {' · '}
            {evento.category}
            {' · '}
            {formatearFechaHora(evento.eventDate)}
            {' · '}
            Mín. {evento.minimumAge}
            {' · '}
            {nombreSede}
          </p>
        </div>
        <Badge tono={evento.status}>{evento.status}</Badge>
      </div>

      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

      <Tarjeta className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
            Publicación
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            El evento es visible al público una vez publicado.
          </p>
        </div>

        <Boton
          variante="primario"
          disabled={evento.status !== 'DRAFT'}
          cargando={publicarMutation.isPending}
          onClick={() => setModalPublicar(true)}
        >
          Publicar evento
        </Boton>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
          Artistas asociados
        </h2>

        {evento.artists.length === 0 ? (
          <p className="text-xs text-slate-500">
            Aún no hay artistas asociados a este evento.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            {evento.artists.map((art, idx) => (
              <AvatarArtista
                key={art.id ?? art.stageName}
                artista={art}
                indice={idx}
              />
            ))}
          </div>
        )}

        <form
          onSubmit={manejarAsociarArtista}
          className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Selector
              etiqueta="Agregar artista"
              value={artistaIdSeleccionado}
              onChange={(e) => setArtistaIdSeleccionado(e.target.value)}
            >
              <option value="">Selecciona un artista</option>
              {artistasQuery.data?.map((art) => {
                const yaAsociado =
                  idsAsociados.has(art.id) || nombresAsociados.has(art.stageName)
                return (
                  <option key={art.id} value={art.id} disabled={yaAsociado}>
                    {art.stageName}
                    {yaAsociado ? ' (ya asociado)' : ''}
                  </option>
                )
              })}
            </Selector>
          </div>
          <Boton
            type="submit"
            variante="secundario"
            disabled={!artistaIdSeleccionado}
            cargando={asociarMutation.isPending}
          >
            <IconoMas className="h-4 w-4" />
            <span>Asociar</span>
          </Boton>
        </form>
      </Tarjeta>

      <div>
        <Link
          to={RUTAS.staffTicketsPagados(evento.eventCode)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
        >
          <span>Tickets pagados</span>
          <IconoFlechaDerecha className="h-4 w-4" />
        </Link>
      </div>

      <Modal
        abierto={modalPublicar}
        titulo="Confirmar publicación"
        onCerrar={() => setModalPublicar(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            ¿Deseas publicar el evento{' '}
            <strong className="font-semibold">{evento.name}</strong> ({evento.eventCode})?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Boton variante="secundario" onClick={() => setModalPublicar(false)}>
              Cancelar
            </Boton>
            <Boton
              variante="primario"
              cargando={publicarMutation.isPending}
              onClick={confirmarPublicacion}
            >
              Confirmar publicación
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
