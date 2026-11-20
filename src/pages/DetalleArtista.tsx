import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useArtista } from '../funcionalidades/artistas/hooks'
import TarjetaEvento from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEventosPorArtista } from '../funcionalidades/eventos/hooks'
import { obtenerIniciales } from '../lib/formato'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

export default function DetalleArtista() {
  const { id } = useParams<{ id: string }>()
  const idNumero = id !== undefined && /^\d+$/.test(id) ? Number(id) : Number.NaN

  const artistaQuery = useArtista(Number.isNaN(idNumero) ? null : idNumero)
  const eventosQuery = useEventosPorArtista(artistaQuery.data?.stageName)

  if (Number.isNaN(idNumero)) {
    return <NoEncontrada />
  }

  if (artistaQuery.isPending) {
    return <Cargando cantidad={2} />
  }

  if (artistaQuery.isError) {
    if (artistaQuery.error instanceof ApiError && artistaQuery.error.status === 404) {
      return <NoEncontrada />
    }
    return (
      <EstadoError
        mensaje={artistaQuery.error.message}
        onReintentar={() => {
          void artistaQuery.refetch()
        }}
      />
    )
  }

  const artista = artistaQuery.data
  if (!artista) return <NoEncontrada />

  const genero = artista.genre ?? artista.musicalGenre ?? 'Música'

  return (
    <div className="space-y-8">
      <Link
        to={RUTAS.artistas}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
      >
        <IconoFlechaIzquierda className="h-4 w-4" />
        <span>Artistas</span>
      </Link>

      <Tarjeta className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-extrabold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200">
          {obtenerIniciales(artista.stageName)}
        </span>
        <div className="space-y-1.5">
          <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {artista.stageName}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nombre artístico · {genero}
          </p>
          {(artista.biography ?? artista.bio) && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {artista.biography ?? artista.bio}
            </p>
          )}
          <div className="pt-1">
            <Badge tono={artista.active ? 'ACTIVO' : 'INACTIVO'}>
              {artista.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </Tarjeta>

      <section className="space-y-4">
        <h2 className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
          Próximos eventos de {artista.stageName}
        </h2>

        {eventosQuery.isPending && <Cargando cantidad={2} />}
        {eventosQuery.isError && (
          <EstadoError
            mensaje={eventosQuery.error.message}
            onReintentar={() => {
              void eventosQuery.refetch()
            }}
          />
        )}
        {eventosQuery.isSuccess && eventosQuery.data.length === 0 && (
          <EstadoVacio mensaje="Sin eventos próximos" />
        )}
        {eventosQuery.isSuccess && eventosQuery.data.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventosQuery.data.map((ev) => (
              <TarjetaEvento key={ev.eventCode} evento={ev} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
