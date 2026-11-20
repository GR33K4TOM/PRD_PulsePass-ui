import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

export const LoginRequestSchema = z.object({
  identifier: z.string().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().optional().default('Bearer'),
  expiresIn: z.number().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

const AuthenticatedUserRawSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    userId: z.union([z.number(), z.string()]).optional(),
    username: z.string(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    roles: z.array(z.string()).optional(),
    role: z.string().optional(),
  })
  .passthrough()

export const AuthenticatedUserResponseSchema = AuthenticatedUserRawSchema.transform((val) => {
  const normalizarRol = (r: string): Rol | null => {
    const limpio = r.replace(/^ROLE_/, '').toUpperCase()
    const parsed = RolSchema.safeParse(limpio)
    return parsed.success ? parsed.data : null
  }
  const listaCruda = val.roles ?? (val.role ? [val.role] : ['USER'])
  const roles = listaCruda.map(normalizarRol).filter((r): r is Rol => r !== null)

  return {
    id: val.id ?? val.userId ?? val.username,
    username: val.username,
    email: val.email,
    firstName: val.firstName,
    lastName: val.lastName,
    roles: roles.length > 0 ? roles : (['USER'] as Rol[]),
  }
})

export type UsuarioAutenticado = z.infer<typeof AuthenticatedUserResponseSchema>

export const SesionAlmacenadaSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number(),
})
export type SesionAlmacenada = z.infer<typeof SesionAlmacenadaSchema>

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; motivoExpiracion?: boolean }
  | {
      estado: 'autenticado'
      token: string
      expiraEn: number
      usuario: UsuarioAutenticado
    }
