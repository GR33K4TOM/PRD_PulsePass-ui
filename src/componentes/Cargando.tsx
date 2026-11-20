export interface PropsCargando {
  mensaje?: string
  cantidad?: number
}

export default function Cargando({
  mensaje = 'Cargando información…',
  cantidad = 3,
}: PropsCargando) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-4 py-6"
    >
      <span className="sr-only">{mensaje}</span>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cantidad }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 h-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="mb-2 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mb-3 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
