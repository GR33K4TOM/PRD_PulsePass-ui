import type { ReactNode } from 'react'
import Tarjeta from './Tarjeta'

export interface PropsEstadoVacio {
  mensaje: string
  accion?: ReactNode
}

export default function EstadoVacio({ mensaje, accion }: PropsEstadoVacio) {
  return (
    <Tarjeta className="flex flex-col items-center justify-center py-12 text-center">
      <p className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-300">
        {mensaje}
      </p>
      {accion && <div>{accion}</div>}
    </Tarjeta>
  )
}
