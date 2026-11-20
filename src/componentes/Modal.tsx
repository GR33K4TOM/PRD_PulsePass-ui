import { useEffect, type ReactNode } from 'react'
import { IconoCerrar } from './Iconos'

export interface PropsModal {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

export default function Modal({ abierto, titulo, onCerrar, children }: PropsModal) {
  useEffect(() => {
    if (!abierto) return
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCerrar()
      }
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 id="modal-titulo" className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <IconoCerrar className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
