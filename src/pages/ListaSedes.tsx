import { Link } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { IconoUbicacion } from '../componentes/Iconos'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { RUTAS } from '../lib/rutas'

export default function ListaSedes() {
  const sedesQuery = useSedesActivas()

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Sedes
      </h1>

      {sedesQuery.isPending && <Cargando cantidad={3} />}
      {sedesQuery.isError && (
        <EstadoError
          mensaje={sedesQuery.error.message}
          onReintentar={() => {
            void sedesQuery.refetch()
          }}
        />
      )}
      {sedesQuery.isSuccess && sedesQuery.data.length === 0 && (
        <EstadoVacio mensaje="No hay sedes activas disponibles" />
      )}
      {sedesQuery.isSuccess && sedesQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sedesQuery.data.map((sede) => (
            <Link
              key={sede.code}
              to={RUTAS.sede(sede.code)}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
                  {sede.name}
                </h2>
                <Badge tono={sede.active ? 'ACTIVO' : 'INACTIVO'}>
                  {sede.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <IconoUbicacion className="h-4 w-4 shrink-0" />
                <span>
                  {sede.city} · Cap. {sede.capacity}
                </span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
