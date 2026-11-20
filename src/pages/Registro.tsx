import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { IconoMusica } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useRegistrarUsuario } from '../funcionalidades/usuarios/hooks'
import {
  RegisterUserRequestSchema,
  type RegisterUserRequest,
} from '../funcionalidades/usuarios/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const CAMPOS_FORMULARIO: (keyof RegisterUserRequest)[] = [
  'username',
  'email',
  'firstName',
  'lastName',
  'birthDate',
  'password',
]

export default function Registro() {
  const navigate = useNavigate()
  const registrarMutation = useRegistrarUsuario()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterUserRequest>({
    resolver: zodResolver(RegisterUserRequestSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      password: '',
    },
  })

  const passwordActual = watch('password') ?? ''
  const fortaleza =
    passwordActual.length >= 16
      ? 'alta'
      : passwordActual.length >= 12
        ? 'media'
        : 'baja'

  const enviar = (datos: RegisterUserRequest) => {
    setErrorGeneral(null)
    registrarMutation.mutate(datos, {
      onSuccess: () => {
        void navigate(RUTAS.login, { state: { registrado: true } })
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.status === 409) {
            setErrorGeneral('El usuario o correo ya está registrado')
            return
          }
          if (err.status === 400 && Object.keys(err.details).length > 0) {
            let asignado = false
            for (const [clave, msg] of Object.entries(err.details)) {
              if (CAMPOS_FORMULARIO.includes(clave as keyof RegisterUserRequest)) {
                setError(clave as keyof RegisterUserRequest, { message: msg })
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
    <div className="mx-auto max-w-lg py-6">
      <Tarjeta className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-600 text-white">
            <IconoMusica className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Crea tu cuenta
          </h1>
        </div>

        <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4">
          <Campo
            etiqueta="Nombre de usuario"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />

          <Campo
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Nombres"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Campo
              etiqueta="Apellidos"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Campo
            etiqueta="Fecha de nacimiento"
            type="date"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />

          <div className="space-y-1.5">
            <Campo
              etiqueta="Contraseña (mín. 12 caracteres)"
              type="password"
              autoComplete="new-password"
              ayuda="Entre 12 caracteres y 72 bytes."
              error={errors.password?.message}
              {...register('password')}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fortaleza: {fortaleza}
            </p>
          </div>

          {errorGeneral && (
            <Aviso tipo="error" rol="alert">
              {errorGeneral}
            </Aviso>
          )}

          <Boton
            type="submit"
            variante="primario"
            cargando={registrarMutation.isPending}
            className="w-full"
          >
            Crear cuenta
          </Boton>
        </form>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to={RUTAS.login}
            className="font-semibold text-marca-600 hover:underline dark:text-marca-500"
          >
            Inicia sesión
          </Link>
        </p>
      </Tarjeta>
    </div>
  )
}
