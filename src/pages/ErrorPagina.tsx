import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import Boton from '../componentes/Boton'
import Tarjeta from '../componentes/Tarjeta'
import { RUTAS } from '../lib/rutas'

export default function ErrorPagina() {
  const error = useRouteError()

  let mensaje = 'Ocurrió un error inesperado. Inténtalo más tarde.'
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      mensaje = 'No encontramos esta página.'
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para acceder a esta sección.'
    }
  }

  return (
    <div className="mx-auto max-w-lg py-12 px-4">
      <Tarjeta className="space-y-4">
        <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
          ¡Ups! Algo salió mal.
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{mensaje}</p>
        <div className="flex items-center gap-3 pt-2">
          <Boton
            variante="primario"
            onClick={() => {
              window.location.reload()
            }}
          >
            Reintentar
          </Boton>
          <Link
            to={RUTAS.inicio}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Volver al inicio
          </Link>
        </div>
      </Tarjeta>
    </div>
  )
}
