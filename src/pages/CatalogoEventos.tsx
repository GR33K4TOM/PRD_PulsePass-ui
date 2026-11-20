import { useSearchParams } from 'react-router'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Selector from '../componentes/Selector'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import TarjetaEvento from '../funcionalidades/eventos/componentes/TarjetaEvento'
import {
  useEventosPorArtista,
  useEventosPublicados,
} from '../funcionalidades/eventos/hooks'
import { EventCategorySchema } from '../funcionalidades/eventos/tipos'

const CATEGORIAS = EventCategorySchema.options

export default function CatalogoEventos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const categoria = searchParams.get('categoria') ?? ''
  const artista = searchParams.get('artista') ?? ''

  const publicadosQuery = useEventosPublicados()
  const porArtistaQuery = useEventosPorArtista(artista || undefined)
  const artistasQuery = useArtistasActivos()

  const consultaActiva = artista ? porArtistaQuery : publicadosQuery
  const listaBase = consultaActiva.data ?? []

  const eventosFiltrados = listaBase.filter((ev) => {
    const coincideTexto = q
      ? ev.name.toLowerCase().includes(q.toLowerCase()) ||
        ev.eventCode.toLowerCase().includes(q.toLowerCase())
      : true
    const coincideCategoria = categoria ? ev.category === categoria : true
    return coincideTexto && coincideCategoria
  })

  const actualizarParametro = (clave: string, valor: string) => {
    const nuevos = new URLSearchParams(searchParams)
    if (valor) {
      nuevos.set(clave, valor)
    } else {
      nuevos.delete(clave)
    }
    setSearchParams(nuevos, { replace: true })
  }

  const limpiarFiltros = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const hayFiltros = Boolean(q || categoria || artista)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Cartelera
        </h1>
      </div>

      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Campo
          etiqueta="Buscar por nombre"
          placeholder="Buscar por nombre..."
          value={q}
          onChange={(e) => actualizarParametro('q', e.target.value)}
        />

        <Selector
          etiqueta="Categoría"
          value={categoria}
          onChange={(e) => actualizarParametro('categoria', e.target.value)}
        >
          <option value="">Todas</option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Selector>

        <Selector
          etiqueta="Artista"
          value={artista}
          onChange={(e) => actualizarParametro('artista', e.target.value)}
        >
          <option value="">Todos</option>
          {artistasQuery.data?.map((art) => (
            <option key={art.id} value={art.stageName}>
              {art.stageName}
            </option>
          ))}
        </Selector>

        <Boton variante="secundario" onClick={limpiarFiltros}>
          Limpiar
        </Boton>
      </div>

      {consultaActiva.isPending && <Cargando cantidad={6} />}

      {consultaActiva.isError && (
        <EstadoError
          mensaje={consultaActiva.error.message}
          onReintentar={() => {
            void consultaActiva.refetch()
          }}
        />
      )}

      {consultaActiva.isSuccess && (
        <>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {eventosFiltrados.length}{' '}
            {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
          </p>

          {eventosFiltrados.length === 0 ? (
            <EstadoVacio
              mensaje={
                hayFiltros
                  ? 'Sin resultados para tu búsqueda'
                  : 'Aún no hay eventos publicados'
              }
              accion={
                hayFiltros ? (
                  <Boton variante="secundario" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </Boton>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventosFiltrados.map((evento) => (
                <TarjetaEvento key={evento.eventCode} evento={evento} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
