import type { ReactNode } from 'react'
import clsx from 'clsx'
import { IconoAdvertencia, IconoCheck } from './Iconos'

export type TipoAviso = 'exito' | 'error' | 'info' | 'advertencia'

const estilosAviso: Record<TipoAviso, string> = {
  exito:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300',
  advertencia:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
  info:
    'border-marca-100 bg-marca-50 text-marca-700 dark:border-slate-700 dark:bg-slate-800 dark:text-marca-500',
}

export interface PropsAviso {
  tipo?: TipoAviso
  children: ReactNode
  className?: string
  rol?: 'alert' | 'status'
}

export default function Aviso({
  tipo = 'info',
  children,
  className,
  rol,
}: PropsAviso) {
  const roleEfectivo = rol ?? (tipo === 'error' || tipo === 'advertencia' ? 'alert' : 'status')

  return (
    <div
      role={roleEfectivo}
      aria-live={roleEfectivo === 'alert' ? 'assertive' : 'polite'}
      className={clsx(
        'flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium',
        estilosAviso[tipo],
        className,
      )}
    >
      {tipo === 'exito' ? (
        <IconoCheck className="h-4 w-4 shrink-0" />
      ) : (
        <IconoAdvertencia className="h-4 w-4 shrink-0" />
      )}
      <div>{children}</div>
    </div>
  )
}
