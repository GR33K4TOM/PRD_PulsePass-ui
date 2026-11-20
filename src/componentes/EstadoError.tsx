import Aviso from './Aviso'
import Boton from './Boton'
import Tarjeta from './Tarjeta'

export interface PropsEstadoError {
  mensaje?: string
  onReintentar?: () => void
}

export default function EstadoError({
  mensaje = 'No pudimos conectar con el servidor.',
  onReintentar,
}: PropsEstadoError) {
  return (
    <Tarjeta className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <Aviso tipo="error">{mensaje}</Aviso>
      {onReintentar && (
        <Boton variante="primario" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </Tarjeta>
  )
}
