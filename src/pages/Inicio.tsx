import { Link } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { IconoFlechaDerecha } from '../componentes/Iconos'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import TarjetaEvento from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'

export default function Inicio() {
  const { sesion } = useAuth()
  const eventosQuery = useEventosPublicados()
  const artistasQuery = useArtistasActivos()

  const proximosEventos = eventosQuery.data?.slice(0, 3) ?? []
  const artistasDestacados = artistasQuery.data?.slice(0, 6) ?? []

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-linear-to-r from-marca-600 to-acento-500 px-6 py-12 text-white shadow-md sm:px-12 sm:py-16">
        <div className="max-w-xl space-y-4">
          <h1 className="font-titulo text-3xl font-extrabold tracking-tight sm:text-4xl">
            Descubre los mejores eventos
          </h1>
          <p className="text-base text-white/90">
            Música, cultura, deporte y tecnología en un solo lugar.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-marca-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver cartelera
            </Link>
            {sesion.estado !== 'autenticado' && (
              <Link
                to={RUTAS.registro}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/60 bg-transparent px-6 py-2.5 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Crear cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
            Próximos eventos
          </h2>
          <Link
            to={RUTAS.eventos}
            className="inline-flex items-center gap-1 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
          >
            <span>Ver todos</span>
            <IconoFlechaDerecha className="h-4 w-4" />
          </Link>
        </div>

        {eventosQuery.isPending && <Cargando cantidad={3} />}
        {eventosQuery.isError && (
          <EstadoError
            mensaje={eventosQuery.error.message}
            onReintentar={() => {
              void eventosQuery.refetch()
            }}
          />
        )}
        {eventosQuery.isSuccess && proximosEventos.length === 0 && (
          <EstadoVacio
            mensaje="Aún no hay eventos publicados"
            accion={
              <Link
                to={RUTAS.artistas}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
              >
                Ver artistas
              </Link>
            }
          />
        )}
        {eventosQuery.isSuccess && proximosEventos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proximosEventos.map((ev) => (
              <TarjetaEvento key={ev.eventCode} evento={ev} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
            Artistas destacados
          </h2>
          <Link
            to={RUTAS.artistas}
            className="inline-flex items-center gap-1 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
          >
            <span>Ver todos</span>
            <IconoFlechaDerecha className="h-4 w-4" />
          </Link>
        </div>

        {artistasQuery.isPending && <Cargando cantidad={3} />}
        {artistasQuery.isError && (
          <EstadoError
            mensaje={artistasQuery.error.message}
            onReintentar={() => {
              void artistasQuery.refetch()
            }}
          />
        )}
        {artistasQuery.isSuccess && artistasDestacados.length > 0 && (
          <div className="flex flex-wrap items-center gap-6">
            {artistasDestacados.map((artista, idx) => (
              <AvatarArtista key={artista.id} artista={artista} indice={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
