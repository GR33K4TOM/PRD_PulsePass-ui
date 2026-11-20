import { forwardRef, useId, type ComponentProps } from 'react'
import clsx from 'clsx'
import { IconoAdvertencia } from './Iconos'

export interface PropsSelector extends ComponentProps<'select'> {
  etiqueta: string
  error?: string
}

const Selector = forwardRef<HTMLSelectElement, PropsSelector>(function Selector(
  { etiqueta, error, id, className, children, ...props },
  ref,
) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idError = `${idCampo}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={idCampo}
        className="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {etiqueta}
      </label>
      <select
        ref={ref}
        id={idCampo}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? idError : undefined}
        className={clsx(
          'min-h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:bg-slate-900 dark:text-slate-100',
          error
            ? 'border-red-500 focus-visible:outline-red-600'
            : 'border-slate-300 dark:border-slate-700',
          className,
        )}
        {...props}
      >
        {children}
      </select>
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

export default Selector
