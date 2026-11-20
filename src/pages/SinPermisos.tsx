import { Link } from 'react-router'
import Tarjeta from '../componentes/Tarjeta'
import { RUTAS } from '../lib/rutas'

export default function SinPermisos() {
  return (
    <div className="mx-auto max-w-md py-12">
      <Tarjeta className="flex flex-col items-center text-center">
        <p className="font-titulo text-5xl font-extrabold text-marca-600">403</p>
        <h1 className="mt-3 font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
          Sin permisos
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          No tienes permisos para acceder a esta sección.
        </p>
        <Link
          to={RUTAS.inicio}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
        >
          Volver al inicio
        </Link>
      </Tarjeta>
    </div>
  )
}
