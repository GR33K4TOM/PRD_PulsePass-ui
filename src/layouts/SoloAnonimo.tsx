import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { RUTAS } from '../lib/rutas'

export default function SoloAnonimo() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando') {
    return <Cargando />
  }

  if (sesion.estado === 'autenticado') {
    const desde = (location.state as { desde?: string } | null)?.desde
    return <Navigate to={desde ?? RUTAS.inicio} replace />
  }

  return <Outlet />
}
