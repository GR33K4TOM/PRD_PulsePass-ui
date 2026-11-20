import { forwardRef, useId, type ComponentProps } from 'react'
import clsx from 'clsx'
import { IconoAdvertencia } from './Iconos'

export interface PropsCampo extends ComponentProps<'input'> {
  etiqueta: string
  error?: string
  ayuda?: string
}

const Campo = forwardRef<HTMLInputElement, PropsCampo>(function Campo(
  { etiqueta, error, ayuda, id, className, ...props },
  ref,
) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idError = `${idCampo}-error`
  const idAyuda = `${idCampo}-ayuda`

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={idCampo}
        className="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {etiqueta}
      </label>
      <input
        ref={ref}
        id={idCampo}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? idError : ayuda ? idAyuda : undefined}
        className={clsx(
          'min-h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:bg-slate-900 dark:text-slate-100',
          error
            ? 'border-red-500 focus-visible:outline-red-600'
            : 'border-slate-300 dark:border-slate-700',
          className,
        )}
        {...props}
      />
      {ayuda && !error && (
        <p id={idAyuda} className="text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      )}
      {error && (
        <p
          id={idError}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <IconoAdvertencia className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

export default Campo
