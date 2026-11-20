import { z } from 'zod'

export const ArtistResponseSchema = z
  .object({
    id: z.number(),
    stageName: z.string(),
    genre: z.string().optional(),
    musicalGenre: z.string().optional(),
    biography: z.string().optional(),
    bio: z.string().optional(),
    country: z.string().optional(),
    active: z.boolean().optional().default(true),
  })
  .passthrough()

export type ArtistResponse = z.infer<typeof ArtistResponseSchema>
export const ListaArtistasSchema = z.array(ArtistResponseSchema)
