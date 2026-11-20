import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { establecerTokenHttp, registrarManejador401 } from '../../lib/http'
import { loginApi, obtenerSesionActualApi } from './api'
import {
  SesionAlmacenadaSchema,
  type LoginRequest,
  type Rol,
  type Sesion,
  type UsuarioAutenticado,
} from './tipos'

const CLAVE_SESSION_STORAGE = 'pulsepass_auth'

export interface ValorAuthContext {
  sesion: Sesion
  iniciarSesion: (credenciales: LoginRequest) => Promise<UsuarioAutenticado>
  cerrarSesion: (expirada?: boolean) => void
  tieneRol: (...roles: Rol[]) => boolean
}

const AuthContext = createContext<ValorAuthContext | null>(null)

export interface PropsAuthProvider {
  children: ReactNode
  sesionInicial?: Sesion
}

export function AuthProvider({ children, sesionInicial }: PropsAuthProvider) {
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion>(() => {
    if (sesionInicial) {
      if (sesionInicial.estado === 'autenticado') {
        establecerTokenHttp(sesionInicial.token)
      } else {
        establecerTokenHttp(null)
      }
      return sesionInicial
    }
    return { estado: 'cargando' }
  })

  const cerrarSesion = useCallback(
    (expirada = false) => {
      establecerTokenHttp(null)
      try {
        sessionStorage.removeItem(CLAVE_SESSION_STORAGE)
      } catch {
        // Ignorar errores de storage
      }
      queryClient.clear()
      setSesion({ estado: 'anonimo', motivoExpiracion: expirada })
    },
    [queryClient],
  )

  useEffect(() => {
    registrarManejador401(() => {
      cerrarSesion(true)
    })
    return () => registrarManejador401(null)
  }, [cerrarSesion])

  useEffect(() => {
    if (sesionInicial) return

    let cancelado = false

    async function restaurar() {
      try {
        const crudo = sessionStorage.getItem(CLAVE_SESSION_STORAGE)
        if (!crudo) {
          if (!cancelado) setSesion({ estado: 'anonimo' })
          return
        }
        const parsed = SesionAlmacenadaSchema.safeParse(JSON.parse(crudo))
        if (!parsed.success || parsed.data.expiraEn <= Date.now()) {
          sessionStorage.removeItem(CLAVE_SESSION_STORAGE)
          establecerTokenHttp(null)
          if (!cancelado) setSesion({ estado: 'anonimo' })
          return
        }
        establecerTokenHttp(parsed.data.token)
        const usuario = await obtenerSesionActualApi()
        if (!cancelado) {
          setSesion({
            estado: 'autenticado',
            token: parsed.data.token,
            expiraEn: parsed.data.expiraEn,
            usuario,
          })
        }
      } catch {
        sessionStorage.removeItem(CLAVE_SESSION_STORAGE)
        establecerTokenHttp(null)
        if (!cancelado) setSesion({ estado: 'anonimo' })
      }
    }

    void restaurar()
    return () => {
      cancelado = true
    }
  }, [sesionInicial])

  useEffect(() => {
    if (sesion.estado !== 'autenticado') return
    const msRestantes = sesion.expiraEn - Date.now()
    if (msRestantes <= 0) {
      cerrarSesion(true)
      return
    }
    const idTimer = window.setTimeout(() => {
      cerrarSesion(true)
    }, msRestantes)
    return () => window.clearTimeout(idTimer)
  }, [sesion, cerrarSesion])

  const iniciarSesion = useCallback(
    async (credenciales: LoginRequest): Promise<UsuarioAutenticado> => {
      const auth = await loginApi(credenciales)
      const expiraEn = Date.now() + auth.expiresIn * 1000
      establecerTokenHttp(auth.accessToken)
      try {
        sessionStorage.setItem(
          CLAVE_SESSION_STORAGE,
          JSON.stringify({ token: auth.accessToken, expiraEn }),
        )
      } catch {
        // Ignorar errores de storage
      }
      const usuario = await obtenerSesionActualApi()
      setSesion({
        estado: 'autenticado',
        token: auth.accessToken,
        expiraEn,
        usuario,
      })
      return usuario
    },
    [],
  )

  const tieneRol = useCallback(
    (...roles: Rol[]): boolean => {
      if (sesion.estado !== 'autenticado') return false
      return roles.some((r) => sesion.usuario.roles.includes(r))
    },
    [sesion],
  )

  const valor = useMemo<ValorAuthContext>(
    () => ({
      sesion,
      iniciarSesion,
      cerrarSesion,
      tieneRol,
    }),
    [sesion, iniciarSesion, cerrarSesion, tieneRol],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): ValorAuthContext {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
