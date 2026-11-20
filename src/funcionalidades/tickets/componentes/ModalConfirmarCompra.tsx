import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Modal from '../../../componentes/Modal'
import type { TicketType } from '../tipos'

export interface PropsModalConfirmarCompra {
  abierto: boolean
  onCerrar: () => void
  onConfirmar: () => void
  cargando: boolean
  nombreEvento: string
  tipoTicket: TicketType
  emailCuenta: string
  errorMensaje?: string | null
}

export default function ModalConfirmarCompra({
  abierto,
  onCerrar,
  onConfirmar,
  cargando,
  nombreEvento,
  tipoTicket,
  emailCuenta,
  errorMensaje,
}: PropsModalConfirmarCompra) {
  return (
    <Modal abierto={abierto} titulo="Confirmar compra" onCerrar={onCerrar}>
      <div className="space-y-4">
        <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Evento</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">{nombreEvento}</dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Tipo</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">{tipoTicket}</dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Cuenta</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">{emailCuenta}</dd>
          </div>
        </dl>

        {errorMensaje && (
          <Aviso tipo="error" rol="alert">
            {errorMensaje}
          </Aviso>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="primario" cargando={cargando} onClick={onConfirmar}>
            Confirmar
          </Boton>
        </div>
      </div>
    </Modal>
  )
}
