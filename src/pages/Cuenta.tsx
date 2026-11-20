import { Link, useNavigate } from 'react-router'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import {
  useUsuarioPorEmail,
  useUsuarioPorUsername,
} from '../funcionalidades/usuarios/hooks'
import { obtenerIniciales } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function Cuenta() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const navigate = useNavigate()

  const emailSesion = sesion.estado === 'autenticado' ? sesion.usuario.email : undefined
  const usernameSesion =
    sesion.estado === 'autenticado' ? sesion.usuario.username : undefined

  const perfilPorEmail = useUsuarioPorEmail(emailSesion)
  const perfilPorUsername = useUsuarioPorUsername(
    perfilPorEmail.isError ? usernameSesion : undefined,
  )

  if (sesion.estado !== 'autenticado') {
    return null
  }

  if (perfilPorEmail.isPending) {
    return <Cargando cantidad={1} />
  }

  if (perfilPorEmail.isError && perfilPorUsername.isError) {
    return (
      <EstadoError
        mensaje={perfilPorEmail.error.message}
        onReintentar={() => {
          void perfilPorEmail.refetch()
        }}
      />
    )
  }

  const perfil = perfilPorEmail.data ?? perfilPorUsername.data
  const nombreCompleto = perfil
    ? `${perfil.firstName} ${perfil.lastName}`.trim()
    : (sesion.usuario.firstName ?? sesion.usuario.username)
  const rolPrincipal = sesion.usuario.roles[0] ?? 'USER'
  const activo = perfil?.active ?? true

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-titulo text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        Mi cuenta
      </h1>

      <Tarjeta className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-marca-100 text-lg font-extrabold text-marca-700 dark:bg-marca-600 dark:text-white">
            {obtenerIniciales(nombreCompleto)}
          </span>
          <div className="space-y-1">
            <h2 className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
              {nombreCompleto}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              @{sesion.usuario.username} · {sesion.usuario.email}
            </p>
            {perfil?.birthDate && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nacimiento: {perfil.birthDate}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-3 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rol:</span>
            <Badge tono="INFO">{rolPrincipal}</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Estado:</span>
            <Badge tono={activo ? 'ACTIVO' : 'INACTIVO'}>
              {activo ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </div>
      </Tarjeta>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {tieneRol('USER') ? (
          <Link
            to={RUTAS.misTickets}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-700"
          >
            Ver mis tickets
          </Link>
        ) : (
          <div />
        )}

        <Boton
          variante="secundario"
          onClick={() => {
            cerrarSesion(false)
            void navigate(RUTAS.inicio)
          }}
        >
          Cerrar sesión
        </Boton>
      </div>
    </div>
  )
}
