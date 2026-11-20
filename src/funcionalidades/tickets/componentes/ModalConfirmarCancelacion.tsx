import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Modal from '../../../componentes/Modal'
import { obtenerNombreEventoTicket, type TicketResponse } from '../tipos'

export interface PropsModalConfirmarCancelacion {
  abierto: boolean
  ticket: TicketResponse | null
  onCerrar: () => void
  onConfirmar: () => void
  cargando: boolean
  errorMensaje?: string | null
}

export default function ModalConfirmarCancelacion({
  abierto,
  ticket,
  onCerrar,
  onConfirmar,
  cargando,
  errorMensaje,
}: PropsModalConfirmarCancelacion) {
  if (!ticket) return null

  return (
    <Modal abierto={abierto} titulo="Cancelar ticket" onCerrar={onCerrar}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          ¿Quieres cancelar el ticket{' '}
          <strong className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {ticket.ticketCode}
          </strong>{' '}
          ({ticket.type}) de {obtenerNombreEventoTicket(ticket)}?
        </p>

        {errorMensaje && (
          <Aviso tipo="error" rol="alert">
            {errorMensaje}
          </Aviso>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Boton variante="secundario" onClick={onCerrar}>
            Volver
          </Boton>
          <Boton variante="peligro" cargando={cargando} onClick={onConfirmar}>
            Cancelar ticket
          </Boton>
        </div>
      </div>
    </Modal>
  )
}
