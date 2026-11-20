import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'

export interface PropsRutaPorRol {
  roles: Rol[]
}

export default function RutaPorRol({ roles }: PropsRutaPorRol) {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return <Cargando />
  }

  if (sesion.estado === 'anonimo') {
    return (
      <Navigate
        to={RUTAS.login}
        replace
        state={{
          desde: location.pathname,
          motivo: sesion.motivoExpiracion ? 'expirada' : undefined,
        }}
      />
    )
  }

  if (!roles.some((r) => sesion.usuario.roles.includes(r))) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }

  return <Outlet />
}
