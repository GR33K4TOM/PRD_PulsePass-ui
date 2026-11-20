import { Link } from 'react-router'
import clsx from 'clsx'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { obtenerIniciales } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const COLORES_TARJETA_ARTISTA: Record<number, string> = {
  0: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200',
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200',
  2: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200',
  3: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200',
}

export default function ListaArtistas() {
  const artistasQuery = useArtistasActivos()

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Artistas
      </h1>

      {artistasQuery.isPending && <Cargando cantidad={3} />}
      {artistasQuery.isError && (
        <EstadoError
          mensaje={artistasQuery.error.message}
          onReintentar={() => {
            void artistasQuery.refetch()
          }}
        />
      )}
      {artistasQuery.isSuccess && artistasQuery.data.length === 0 && (
        <EstadoVacio mensaje="No hay artistas activos disponibles" />
      )}
      {artistasQuery.isSuccess && artistasQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {artistasQuery.data.map((artista, idx) => {
            const color =
              COLORES_TARJETA_ARTISTA[idx % 4] ?? COLORES_TARJETA_ARTISTA[0]
            const genero = artista.genre ?? artista.musicalGenre ?? 'Artista invitado'

            return (
              <Link
                key={artista.id}
                to={RUTAS.artista(artista.id)}
                className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
              >
                <span
                  className={clsx(
                    'flex h-16 w-16 items-center justify-center rounded-full text-lg font-extrabold',
                    color,
                  )}
                >
                  {obtenerIniciales(artista.stageName)}
                </span>
                <h2 className="mt-4 font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
                  {artista.stageName}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {genero}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
