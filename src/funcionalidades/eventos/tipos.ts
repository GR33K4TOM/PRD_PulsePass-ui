import { z } from 'zod'
import { ArtistResponseSchema } from '../artistas/tipos'
import { VenueResponseSchema } from '../sedes/tipos'

export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])
export type EventCategory = z.infer<typeof EventCategorySchema>

export const EventStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])
export type EventStatus = z.infer<typeof EventStatusSchema>

export const EventSummaryResponseSchema = z
  .object({
    eventCode: z.string(),
    name: z.string(),
    category: EventCategorySchema,
    eventDate: z.string(),
    status: EventStatusSchema,
    city: z.string().optional(),
    venueCity: z.string().optional(),
    venueName: z.string().optional(),
    venueCode: z.string().optional(),
    venue: VenueResponseSchema.optional(),
  })
  .passthrough()

export type EventSummaryResponse = z.infer<typeof EventSummaryResponseSchema>
export const ListaEventosSummarySchema = z.array(EventSummaryResponseSchema)

const ArtistaEnEventoSchema = z.union([
  ArtistResponseSchema,
  z.string().transform((stageName) => ({
    id: 1,
    stageName,
    active: true,
    genre: undefined,
    musicalGenre: undefined,
    biography: undefined,
    bio: undefined,
    country: undefined,
  })),
])

export const EventResponseSchema = z
  .object({
    eventCode: z.string(),
    name: z.string(),
    description: z.string().optional().default(''),
    category: EventCategorySchema,
    eventDate: z.string(),
    minimumAge: z.number().optional().default(0),
    status: EventStatusSchema,
    venueCode: z.string().optional(),
    venueName: z.string().optional(),
    venueCity: z.string().optional(),
    venueCapacity: z.number().optional(),
    city: z.string().optional(),
    venue: VenueResponseSchema.optional(),
    artists: z.array(ArtistaEnEventoSchema).optional().default([]),
  })
  .passthrough()

export type EventResponse = z.infer<typeof EventResponseSchema>
export const ListaEventosSchema = z.array(EventResponseSchema)

export const CreateEventRequestSchema = z.object({
  eventCode: z.string().min(1, 'El código del evento es obligatorio'),
  name: z.string().min(1, 'El nombre del evento es obligatorio'),
  description: z
    .string()
    .min(1, 'La descripción es obligatoria')
    .max(500, 'La descripción no puede superar 500 caracteres'),
  category: EventCategorySchema,
  eventDate: z.string().min(1, 'La fecha y hora son obligatorias'),
  minimumAge: z.coerce
    .number({ invalid_type_error: 'Ingresa una edad válida' })
    .int('Debe ser un número entero')
    .min(0, 'La edad mínima no puede ser negativa'),
  venueCode: z.string().min(1, 'Selecciona una sede'),
})

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>
