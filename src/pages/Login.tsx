import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { IconoMusica } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { useLogin } from '../funcionalidades/auth/hooks'
import { LoginRequestSchema, type LoginRequest } from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

interface EstadoUbicacionLogin {
  desde?: string
  registrado?: boolean
  motivo?: string
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sesion } = useAuth()
  const loginMutation = useLogin()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const estadoLoc = (location.state as EstadoUbicacionLogin | null) ?? null
  const [rutaOrigen] = useState(() => estadoLoc?.desde ?? RUTAS.inicio)
  const fueRegistrado = Boolean(estadoLoc?.registrado)
  const sesionExpirada =
    estadoLoc?.motivo === 'expirada' ||
    (sesion.estado === 'anonimo' && Boolean(sesion.motivoExpiracion))

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const enviar = (datos: LoginRequest) => {
    setErrorGeneral(null)
    loginMutation.mutate(datos, {
      onSuccess: () => {
        void navigate(rutaOrigen, { replace: true })
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setErrorGeneral('Credenciales inválidas.')
            return
          }
          if (err.status === 400 && Object.keys(err.details).length > 0) {
            let asignado = false
            for (const [campo, msg] of Object.entries(err.details)) {
              if (campo === 'identifier' || campo === 'password') {
                setError(campo, { message: msg })
                asignado = true
              }
            }
            if (asignado) return
          }
        }
        setErrorGeneral('Inténtalo más tarde.')
      },
    })
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <Tarjeta className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-600 text-white">
            <IconoMusica className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Inicia sesión
          </h1>
        </div>

        {fueRegistrado && (
          <Aviso tipo="exito">Cuenta creada, inicia sesión.</Aviso>
        )}

        {sesionExpirada && (
          <Aviso tipo="info">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>
        )}

        <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
          <Campo
            etiqueta="Usuario o correo"
            autoComplete="username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />

          <Campo
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {errorGeneral && (
            <Aviso tipo="error" rol="alert">
              {errorGeneral}
            </Aviso>
          )}

          <Boton
            type="submit"
            variante="primario"
            cargando={loginMutation.isPending}
            className="w-full"
          >
            Ingresar
          </Boton>
        </form>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            to={RUTAS.registro}
            className="font-semibold text-marca-600 hover:underline dark:text-marca-500"
          >
            Regístrate
          </Link>
        </p>
      </Tarjeta>
    </div>
  )
}
