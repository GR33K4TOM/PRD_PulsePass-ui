import { Link } from 'react-router'
import clsx from 'clsx'
import { obtenerIniciales } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { ArtistResponse } from '../tipos'

const COLORES_AVATAR: Record<number, string> = {
  0: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200',
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200',
  2: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200',
  3: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200',
}

export interface PropsAvatarArtista {
  artista: Pick<ArtistResponse, 'id' | 'stageName'>
  indice?: number
  enlazar?: boolean
}

export default function AvatarArtista({
  artista,
  indice = 0,
  enlazar = true,
}: PropsAvatarArtista) {
  const color = COLORES_AVATAR[indice % 4] ?? COLORES_AVATAR[0]
  const contenido = (
    <>
      <span
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          color,
        )}
      >
        {obtenerIniciales(artista.stageName)}
      </span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {artista.stageName}
      </span>
    </>
  )

  if (!enlazar) {
    return <div className="inline-flex items-center gap-2.5">{contenido}</div>
  }

  return (
    <Link
      to={RUTAS.artista(artista.id)}
      className="inline-flex items-center gap-2.5 rounded-full pr-3 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
    >
      {contenido}
    </Link>
  )
}
