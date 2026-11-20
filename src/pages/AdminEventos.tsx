import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { IconoMas } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { obtenerEventoPorCodigoApi } from '../funcionalidades/eventos/api'
import {
  obtenerEventosCreadosSesion,
  registrarEventoEnSesion,
} from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'

export default function AdminEventos() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [creadosSesion, setCreadosSesion] = useState(() =>
    obtenerEventosCreadosSesion(),
  )

  const manejarAbrir = async (e: FormEvent) => {
    e.preventDefault()
    const limpio = codigo.trim()
    if (!limpio) {
      setErrorBusqueda('Ingresa un código de evento')
      return
    }
    setErrorBusqueda(null)
    setBuscando(true)
    try {
      const evento = await obtenerEventoPorCodigoApi(limpio)
      registrarEventoEnSesion(evento)
      setCreadosSesion(obtenerEventosCreadosSesion())
      void navigate(RUTAS.adminGestionEvento(evento.eventCode))
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'No se pudo consultar el evento'
      setErrorBusqueda(mensaje)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Administración de eventos
        </h1>
        <Link
          to={RUTAS.adminCrearEvento}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-marca-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
        >
          <IconoMas className="h-4 w-4" />
          <span>Nuevo evento</span>
        </Link>
      </div>

      <form onSubmit={(e) => void manejarAbrir(e)} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Campo
            etiqueta="Buscar evento por código"
            placeholder="CMF-2026"
            value={codigo}
            error={errorBusqueda ?? undefined}
            onChange={(e) => setCodigo(e.target.value)}
            className="font-mono"
          />
        </div>
        <Boton type="submit" variante="secundario" cargando={buscando}>
          Abrir
        </Boton>
      </form>

      <section className="space-y-3">
        <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
          Creados en esta sesión
        </h2>

        {creadosSesion.length === 0 ? (
          <Tarjeta className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No has creado ni consultado eventos en esta sesión.
          </Tarjeta>
        ) : (
          <div className="space-y-3">
            {creadosSesion.map((ev) => (
              <Tarjeta
                key={ev.eventCode}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="text-sm">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {ev.eventCode}
                  </span>
                  {' · '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {ev.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tono={ev.status}>{ev.status}</Badge>
                  <Link
                    to={RUTAS.adminGestionEvento(ev.eventCode)}
                    className="inline-flex min-h-9 items-center justify-center rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100"
                  >
                    Gestionar
                  </Link>
                </div>
              </Tarjeta>
            ))}
          </div>
        )}
      </section>

      <Aviso tipo="info">
        Nota: la API no ofrece un listado completo de eventos (GAP-01).
      </Aviso>
    </div>
  )
}
