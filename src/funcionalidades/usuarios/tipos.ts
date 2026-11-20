import { z } from 'zod'

export const UserResponseSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    username: z.string(),
    email: z.string().email(),
    firstName: z.string().optional().default(''),
    lastName: z.string().optional().default(''),
    birthDate: z.string().optional().default(''),
    active: z.boolean().optional().default(true),
  })
  .passthrough()

export type UserResponse = z.infer<typeof UserResponseSchema>

export const RegisterUserRequestSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es obligatorio'),
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  firstName: z.string().min(1, 'Los nombres son obligatorios'),
  lastName: z.string().min(1, 'Los apellidos son obligatorios'),
  birthDate: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .refine((val) => {
      const fecha = new Date(val)
      if (Number.isNaN(fecha.getTime())) return false
      return fecha.getTime() <= Date.now()
    }, 'La fecha de nacimiento no puede ser futura'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .refine(
      (val) => new TextEncoder().encode(val).length <= 72,
      'La contraseña no puede exceder 72 bytes',
    ),
})

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>
