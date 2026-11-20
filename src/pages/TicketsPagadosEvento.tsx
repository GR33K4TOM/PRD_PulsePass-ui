import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import PrecioCOP from '../componentes/PrecioCOP'
import Tabla from '../componentes/Tabla'
import Tarjeta from '../componentes/Tarjeta'
import {
  useTicketsPagadosPorEvento,
  useUsarTicket,
} from '../funcionalidades/tickets/hooks'
import {
  obtenerTitularTicket,
  type TicketResponse,
} from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function TicketsPagadosEvento() {
  const { eventCode } = useParams<{ eventCode: string }>()
  const navigate = useNavigate()
  const [codigoInput, setCodigoInput] = useState(eventCode ?? '')
  const [avisoAccion, setAvisoAccion] = useState<{
    tipo: 'exito' | 'error'
    texto: string
  } | null>(null)

  const ticketsQuery = useTicketsPagadosPorEvento(eventCode)
  const usarMutation = useUsarTicket(eventCode)

  const cambiarEvento = (e: FormEvent) => {
    e.preventDefault()
    const limpio = codigoInput.trim()
    if (!limpio) return
    void navigate(RUTAS.staffTicketsPagados(limpio))
  }

  const manejarUsar = (ticketCode: string) => {
    setAvisoAccion(null)
    usarMutation.mutate(ticketCode, {
      onSuccess: () => {
        setAvisoAccion({ tipo: 'exito', texto: `Ticket ${ticketCode} marcado como usado.` })
      },
      onError: (err) => {
        setAvisoAccion({ tipo: 'error', texto: err.message })
      },
    })
  }

  const lista = ticketsQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Tickets pagados · {eventCode}
          </h1>
          {ticketsQuery.isSuccess && (
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Total: {lista.length}
            </p>
          )}
        </div>

        <form onSubmit={cambiarEvento} className="flex items-end gap-2">
          <Campo
            etiqueta="Evento"
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value)}
            className="font-mono"
          />
          <Boton type="submit" variante="secundario">
            Ir
          </Boton>
        </form>
      </div>

      {avisoAccion && (
        <Aviso tipo={avisoAccion.tipo}>{avisoAccion.texto}</Aviso>
      )}

      {ticketsQuery.isPending && <Cargando cantidad={3} />}

      {ticketsQuery.isError && (
        <EstadoError
          mensaje={
            ticketsQuery.error instanceof ApiError && ticketsQuery.error.status === 404
              ? 'Evento no encontrado'
              : ticketsQuery.error.message
          }
          onReintentar={() => {
            void ticketsQuery.refetch()
          }}
        />
      )}

      {ticketsQuery.isSuccess && lista.length === 0 && (
        <EstadoVacio mensaje="No hay tickets pagados" />
      )}

      {ticketsQuery.isSuccess && lista.length > 0 && (
        <>
          <div className="hidden md:block">
            <Tabla<TicketResponse>
              obtenerClave={(t) => t.ticketCode}
              filas={lista}
              columnas={[
                {
                  encabezado: 'Código',
                  celda: (t) => (
                    <span className="font-mono font-semibold">{t.ticketCode}</span>
                  ),
                },
                {
                  encabezado: 'Tipo',
                  celda: (t) => t.type,
                },
                {
                  encabezado: 'Titular',
                  celda: (t) => obtenerTitularTicket(t),
                },
                {
                  encabezado: 'Precio',
                  celda: (t) => <PrecioCOP valor={t.price} />,
                },
                {
                  encabezado: 'Estado',
                  celda: (t) => <Badge tono={t.status}>{t.status}</Badge>,
                },
                {
                  encabezado: 'Acción',
                  celda: (t) => (
                    <Boton
                      variante="primario"
                      disabled={usarMutation.isPending}
                      onClick={() => manejarUsar(t.ticketCode)}
                      className="min-h-9 px-3 py-1.5 text-xs"
                    >
                      Usar
                    </Boton>
                  ),
                },
              ]}
            />
          </div>

          <div className="space-y-4 md:hidden">
            {lista.map((t) => (
              <Tarjeta key={t.ticketCode} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.ticketCode}
                  </span>
                  <Badge tono={t.status}>{t.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t.type} · {obtenerTitularTicket(t)} · <PrecioCOP valor={t.price} />
                </p>
                <Boton
                  variante="primario"
                  disabled={usarMutation.isPending}
                  onClick={() => manejarUsar(t.ticketCode)}
                  className="w-full"
                >
                  Usar
                </Boton>
              </Tarjeta>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
