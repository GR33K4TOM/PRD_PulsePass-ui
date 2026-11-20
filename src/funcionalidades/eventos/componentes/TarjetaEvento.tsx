import type { ReactNode } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import Badge from '../../../componentes/Badge'
import {
  IconoCalendario,
  IconoCultura,
  IconoDeporte,
  IconoEducacion,
  IconoEntretenimiento,
  IconoMusica,
  IconoTecnologia,
  IconoUbicacion,
} from '../../../componentes/Iconos'
import { formatearFecha } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { EventCategory, EventSummaryResponse } from '../tipos'

export const ESTILOS_CATEGORIA: Record<
  EventCategory,
  { fondo: string; texto: string; icono: ReactNode }
> = {
  MUSIC: {
    fondo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
    texto: 'text-indigo-600 dark:text-indigo-400',
    icono: <IconoMusica className="h-9 w-9" />,
  },
  TECHNOLOGY: {
    fondo: 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300',
    texto: 'text-sky-600 dark:text-sky-400',
    icono: <IconoTecnologia className="h-9 w-9" />,
  },
  SPORTS: {
    fondo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
    texto: 'text-emerald-600 dark:text-emerald-400',
    icono: <IconoDeporte className="h-9 w-9" />,
  },
  CULTURE: {
    fondo: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    texto: 'text-rose-600 dark:text-rose-400',
    icono: <IconoCultura className="h-9 w-9" />,
  },
  EDUCATION: {
    fondo: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
    texto: 'text-amber-600 dark:text-amber-400',
    icono: <IconoEducacion className="h-9 w-9" />,
  },
  ENTERTAINMENT: {
    fondo: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    texto: 'text-purple-600 dark:text-purple-400',
    icono: <IconoEntretenimiento className="h-9 w-9" />,
  },
}

export interface PropsTarjetaEvento {
  evento: EventSummaryResponse
}

export default function TarjetaEvento({ evento }: PropsTarjetaEvento) {
  const visual = ESTILOS_CATEGORIA[evento.category]
  const ciudadOSede =
    evento.city ??
    evento.venueCity ??
    evento.venue?.city ??
    evento.venueName ??
    evento.venue?.name ??
    'Santa Marta'

  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        className={clsx(
          'flex h-36 items-center justify-center transition-colors',
          visual.fondo,
        )}
      >
        {visual.icono}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className={clsx('text-xs font-bold tracking-wider uppercase', visual.texto)}>
          {evento.category}
        </span>
        <h3 className="font-titulo text-base font-bold text-slate-900 group-hover:text-marca-600 dark:text-slate-100 dark:group-hover:text-marca-500">
          {evento.name}
        </h3>
        <div className="mt-1 space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <p className="flex items-center gap-1.5">
            <IconoCalendario className="h-3.5 w-3.5 shrink-0" />
            <span>{formatearFecha(evento.eventDate)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <IconoUbicacion className="h-3.5 w-3.5 shrink-0" />
            <span>{ciudadOSede}</span>
          </p>
        </div>
        <div className="mt-auto pt-3">
          <Badge tono={evento.status}>{evento.status}</Badge>
        </div>
      </div>
    </Link>
  )
}
