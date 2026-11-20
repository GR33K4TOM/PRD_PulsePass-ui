import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import clsx from 'clsx'
import {
  IconoCerrar,
  IconoChevronAbajo,
  IconoMenu,
  IconoMusica,
} from '../componentes/Iconos'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { obtenerIniciales } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function Layout() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)

  useEffect(() => {
    setMenuMovilAbierto(false)
    setMenuUsuarioAbierto(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuMovilAbierto && !menuUsuarioAbierto) return
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuMovilAbierto(false)
        setMenuUsuarioAbierto(false)
      }
    }
    window.addEventListener('keydown', manejarEscape)
    return () => window.removeEventListener('keydown', manejarEscape)
  }, [menuMovilAbierto, menuUsuarioAbierto])

  const esUser = tieneRol('USER')
  const esStaffOAdmin = tieneRol('STAFF', 'ADMIN')
  const esAdmin = tieneRol('ADMIN')

  const claseNavLink = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
      isActive
        ? 'bg-marca-50 text-marca-600 dark:bg-slate-800 dark:text-marca-500'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    )

  const manejarSalir = () => {
    cerrarSesion(false)
    void navigate(RUTAS.inicio)
  }

  const nombreVisible =
    sesion.estado === 'autenticado'
      ? (sesion.usuario.firstName ?? sesion.usuario.username)
      : ''

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-marca-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <NavLink
              to={RUTAS.inicio}
              end
              className="flex items-center gap-2.5 font-titulo text-lg font-extrabold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marca-600 text-white">
                <IconoMusica className="h-5 w-5" />
              </span>
              <span>PulsePass</span>
            </NavLink>

            <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
              <NavLink to={RUTAS.eventos} className={claseNavLink}>
                Eventos
              </NavLink>
              <NavLink to={RUTAS.artistas} className={claseNavLink}>
                Artistas
              </NavLink>
              <NavLink to={RUTAS.sedes} className={claseNavLink}>
                Sedes
              </NavLink>
              {esUser && (
                <NavLink to={RUTAS.misTickets} className={claseNavLink}>
                  Mis tickets
                </NavLink>
              )}
              {esStaffOAdmin && (
                <>
                  <NavLink to={RUTAS.staffValidacion} className={claseNavLink}>
                    Validar ingreso
                  </NavLink>
                  <NavLink
                    to={RUTAS.staffTicketsPagados('CMF-2026')}
                    className={claseNavLink}
                  >
                    Tickets pagados
                  </NavLink>
                </>
              )}
              {esAdmin && (
                <NavLink to={RUTAS.adminEventos} className={claseNavLink}>
                  Administrar eventos
                </NavLink>
              )}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {sesion.estado !== 'autenticado' ? (
              <>
                <Link
                  to={RUTAS.login}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-marca-600 hover:bg-marca-50 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-marca-500 dark:hover:bg-slate-800"
                >
                  Ingresar
                </Link>
                <Link
                  to={RUTAS.registro}
                  className="rounded-xl bg-marca-600 px-4 py-2 text-sm font-semibold text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuUsuarioAbierto((prev) => !prev)}
                  aria-expanded={menuUsuarioAbierto}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-marca-100 text-xs font-bold text-marca-700 dark:bg-marca-600 dark:text-white">
                    {obtenerIniciales(nombreVisible)}
                  </span>
                  <span>{nombreVisible}</span>
                  <IconoChevronAbajo className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {menuUsuarioAbierto && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <Link
                      to={RUTAS.cuenta}
                      className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Mi cuenta
                    </Link>
                    {esUser && (
                      <Link
                        to={RUTAS.misTickets}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Mis tickets
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={manejarSalir}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-800"
                    >
                      Salir
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuMovilAbierto}
            onClick={() => setMenuMovilAbierto((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 md:hidden dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {menuMovilAbierto ? (
              <IconoCerrar className="h-6 w-6" />
            ) : (
              <IconoMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {menuMovilAbierto && (
          <nav
            aria-label="Menú móvil"
            className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-1">
              <NavLink to={RUTAS.eventos} className={claseNavLink}>
                Eventos
              </NavLink>
              <NavLink to={RUTAS.artistas} className={claseNavLink}>
                Artistas
              </NavLink>
              <NavLink to={RUTAS.sedes} className={claseNavLink}>
                Sedes
              </NavLink>
              {esUser && (
                <NavLink to={RUTAS.misTickets} className={claseNavLink}>
                  Mis tickets
                </NavLink>
              )}
              {esStaffOAdmin && (
                <>
                  <NavLink to={RUTAS.staffValidacion} className={claseNavLink}>
                    Validar ingreso
                  </NavLink>
                  <NavLink
                    to={RUTAS.staffTicketsPagados('CMF-2026')}
                    className={claseNavLink}
                  >
                    Tickets pagados
                  </NavLink>
                </>
              )}
              {esAdmin && (
                <NavLink to={RUTAS.adminEventos} className={claseNavLink}>
                  Administrar eventos
                </NavLink>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              {sesion.estado !== 'autenticado' ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={RUTAS.login}
                    className="flex-1 rounded-xl border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    Ingresar
                  </Link>
                  <Link
                    to={RUTAS.registro}
                    className="flex-1 rounded-xl bg-marca-600 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Registrarse
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    to={RUTAS.cuenta}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200"
                  >
                    Mi cuenta ({nombreVisible})
                  </Link>
                  <button
                    type="button"
                    onClick={manejarSalir}
                    className="rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <p>© 2026 PulsePass · Caso de estudio académico</p>
          <div className="flex items-center gap-4">
            <Link to={RUTAS.sedes} className="hover:text-slate-800 dark:hover:text-slate-200">
              Sedes
            </Link>
            <Link to={RUTAS.artistas} className="hover:text-slate-800 dark:hover:text-slate-200">
              Artistas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
