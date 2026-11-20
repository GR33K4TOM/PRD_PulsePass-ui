import type { ReactNode } from 'react'

export interface ColumnaTabla<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
}

export interface PropsTabla<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  obtenerClave: (fila: T) => string
}

export default function Tabla<T>({ columnas, filas, obtenerClave }: PropsTabla<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          <tr>
            {columnas.map((col) => (
              <th key={col.encabezado} className="px-4 py-3.5">
                {col.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {filas.map((fila) => (
            <tr
              key={obtenerClave(fila)}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
            >
              {columnas.map((col) => (
                <td key={col.encabezado} className="px-4 py-3.5 text-slate-800 dark:text-slate-200">
                  {col.celda(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
