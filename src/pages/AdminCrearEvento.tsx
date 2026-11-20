import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { IconoAdvertencia, IconoFlechaIzquierda } from '../componentes/Iconos'
import Selector from '../componentes/Selector'
import Tarjeta from '../componentes/Tarjeta'
import { useCrearEvento } from '../funcionalidades/eventos/hooks'
import {
  CreateEventRequestSchema,
  EventCategorySchema,
  type CreateEventRequest,
} from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const CATEGORIAS = EventCategorySchema.options
const CAMPOS_EVENTO: (keyof CreateEventRequest)[] = [
  'eventCode',
  'name',
  'description',
  'category',
  'eventDate',
  'minimumAge',
  'venueCode',
]

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const sedesQuery = useSedesActivas()
  const crearMutation = useCrearEvento()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const idDesc = useId()

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<CreateEventRequest>({
    resolver: zodResolver(CreateEventRequestSchema),
    defaultValues: {
      eventCode: '',
      name: '',
      description: '',
      category: 'MUSIC',
      eventDate: '',
      minimumAge: 18,
      venueCode: '',
    },
  })

  const descripcionActual = watch('description') ?? ''

  const enviar = (datos: CreateEventRequest) => {
    setErrorGeneral(null)
    crearMutation.mutate(datos, {
      onSuccess: (creado) => {
        void navigate(RUTAS.adminGestionEvento(creado.eventCode), {
          state: { creado: true },
        })
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.status === 403) {
            void navigate(RUTAS.sinPermisos)
            return
          }
          if (err.status === 400 && Object.keys(err.details).length > 0) {
            let asignado = false
            for (const [clave, msg] of Object.entries(err.details)) {
              if (CAMPOS_EVENTO.includes(clave as keyof CreateEventRequest)) {
                setError(clave as keyof CreateEventRequest, { message: msg })
                asignado = true
              }
            }
            if (asignado) return
          }
          setErrorGeneral(err.message)
          return
        }
        setErrorGeneral('Ocurrió un error inesperado. Inténtalo más tarde.')
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={RUTAS.adminEventos}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
      >
        <IconoFlechaIzquierda className="h-4 w-4" />
        <span>Eventos</span>
      </Link>

      <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Nuevo evento
      </h1>

      <Tarjeta>
        <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
          {errorGeneral && (
            <Aviso tipo="error" rol="alert">
              {errorGeneral}
            </Aviso>
          )}

          <Campo
            etiqueta="Código del evento"
            placeholder="CMF-2026"
            error={errors.eventCode?.message}
            className="font-mono"
            {...register('eventCode')}
          />

          <Campo
            etiqueta="Nombre"
            placeholder="Caribbean Music Fest 2026"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={idDesc}
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Descripción
            </label>
            <textarea
              id={idDesc}
              rows={3}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? `${idDesc}-error` : undefined}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('description')}
            />
            <div className="flex items-center justify-between text-xs">
              {errors.description ? (
                <p
                  id={`${idDesc}-error`}
                  role="alert"
                  className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400"
                >
                  <IconoAdvertencia className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.description.message}</span>
                </p>
              ) : (
                <span />
              )}
              <span className="text-slate-400">{descripcionActual.length}/500</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Selector
              etiqueta="Categoría"
              error={errors.category?.message}
              {...register('category')}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Selector>

            <Campo
              etiqueta="Edad mínima"
              type="number"
              min={0}
              error={errors.minimumAge?.message}
              {...register('minimumAge')}
            />
          </div>

          <Campo
            etiqueta="Fecha y hora"
            type="datetime-local"
            error={errors.eventDate?.message}
            {...register('eventDate')}
          />

          <Selector
            etiqueta="Sede"
            error={errors.venueCode?.message}
            {...register('venueCode')}
          >
            <option value="">Selecciona una sede</option>
            {sedesQuery.data?.map((sede) => (
              <option key={sede.code} value={sede.code}>
                {sede.name} ({sede.code})
              </option>
            ))}
          </Selector>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to={RUTAS.adminEventos}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Cancelar
            </Link>
            <Boton
              type="submit"
              variante="primario"
              cargando={crearMutation.isPending}
            >
              Crear evento
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}
