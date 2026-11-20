import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useSede } from '../funcionalidades/sedes/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

export default function DetalleSede() {
  const { code } = useParams<{ code: string }>()
  const sedeQuery = useSede(code)

  if (sedeQuery.isPending) {
    return <Cargando cantidad={1} />
  }

  if (sedeQuery.isError) {
    if (sedeQuery.error instanceof ApiError && sedeQuery.error.status === 404) {
      return <NoEncontrada />
    }
    return (
      <EstadoError
        mensaje={sedeQuery.error.message}
        onReintentar={() => {
          void sedeQuery.refetch()
        }}
      />
    )
  }

  const sede = sedeQuery.data
  if (!sede) return <NoEncontrada />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={RUTAS.sedes}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
      >
        <IconoFlechaIzquierda className="h-4 w-4" />
        <span>Sedes</span>
      </Link>

      <Tarjeta className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {sede.name}
          </h1>
          <Badge tono={sede.active ? 'ACTIVO' : 'INACTIVO'}>
            {sede.active ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>

        <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Código</dt>
            <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {sede.code}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Ciudad</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              {sede.city}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Capacidad</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              {sede.capacity} personas
            </dd>
          </div>
          {sede.address && (
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-500 dark:text-slate-400">Dirección</dt>
              <dd className="font-semibold text-slate-900 dark:text-slate-100">
                {sede.address}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between py-3">
            <dt className="text-slate-500 dark:text-slate-400">Estado</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              {sede.active ? 'Activa' : 'Inactiva'}
            </dd>
          </div>
        </dl>
      </Tarjeta>
    </div>
  )
}
