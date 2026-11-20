import { z } from 'zod'

export const ErrorResponseSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number(),
  error: z.string().optional(),
  message: z.string(),
  details: z.record(z.string(), z.string()).optional().default({}),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let tokenEnMemoria: string | null = null
let manejadorNoAutorizado: (() => void) | null = null

export function establecerTokenHttp(token: string | null): void {
  tokenEnMemoria = token
}

export function obtenerTokenHttp(): string | null {
  return tokenEnMemoria
}

export function registrarManejador401(fn: (() => void) | null): void {
  manejadorNoAutorizado = fn
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

export interface OpcionesHttp extends Omit<RequestInit, 'body'> {
  body?: unknown
  omitirManejador401?: boolean
}

export async function peticionHttp<S extends z.ZodTypeAny>(
  ruta: string,
  esquema: S,
  opciones: OpcionesHttp = {},
): Promise<z.output<S>> {
  const { body, headers, omitirManejador401 = false, ...resto } = opciones

  const encabezados = new Headers(headers)
  if (body !== undefined && !encabezados.has('Content-Type')) {
    encabezados.set('Content-Type', 'application/json')
  }
  if (tokenEnMemoria && !encabezados.has('Authorization')) {
    encabezados.set('Authorization', `Bearer ${tokenEnMemoria}`)
  }

  const url = ruta.startsWith('http') || ruta.startsWith('/api')
    ? ruta
    : `${API_BASE_URL}${ruta.startsWith('/') ? ruta : `/${ruta}`}`

  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      ...resto,
      headers: encabezados,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor.')
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !omitirManejador401) {
      manejadorNoAutorizado?.()
    }

    const cuerpoCrudo: unknown = await respuesta.json().catch(() => null)
    const validado = ErrorResponseSchema.safeParse(cuerpoCrudo)

    if (validado.success) {
      const msg =
        respuesta.status >= 500
          ? 'Ocurrió un error inesperado. Inténtalo más tarde.'
          : validado.data.message
      throw new ApiError(
        validado.data.status || respuesta.status,
        msg,
        validado.data.details,
      )
    }

    const mensajePorDefecto =
      respuesta.status === 401
        ? 'Credenciales inválidas'
        : respuesta.status === 403
          ? 'No tienes permisos para realizar esta acción.'
          : respuesta.status === 404
            ? 'Recurso no disponible.'
            : 'Ocurrió un error inesperado. Inténtalo más tarde.'

    throw new ApiError(respuesta.status, mensajePorDefecto)
  }

  if (respuesta.status === 204) {
    return esquema.parse(undefined)
  }

  const datosCrudos: unknown = await respuesta.json()
  return esquema.parse(datosCrudos)
}
