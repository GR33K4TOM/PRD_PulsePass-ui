import type { ComponentProps } from 'react'
import clsx from 'clsx'

export type PropsTarjeta = ComponentProps<'div'>

export default function Tarjeta({ children, className, ...props }: PropsTarjeta) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
