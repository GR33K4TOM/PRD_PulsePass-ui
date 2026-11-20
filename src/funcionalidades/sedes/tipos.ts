import { z } from 'zod'

export const VenueResponseSchema = z
  .object({
    code: z.string(),
    name: z.string(),
    city: z.string(),
    address: z.string().optional(),
    capacity: z.number(),
    active: z.boolean().optional().default(true),
  })
  .passthrough()

export type VenueResponse = z.infer<typeof VenueResponseSchema>
export const ListaVenuesSchema = z.array(VenueResponseSchema)
