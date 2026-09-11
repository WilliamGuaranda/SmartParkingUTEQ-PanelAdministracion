import React from 'react'
import { CBadge, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCarAlt,
  cilCheckCircle,
  cilCog,
  cilContact,
  cilDescription,
  cilSignalCellular3,
  cilWarning,
  cilXCircle,
} from '@coreui/icons'

import {
  clasificarEstado,
  enmascararCedula,
  formatearConfianza,
  obtenerDatosVehiculo,
} from '../../utils/ocrResultado'

const estiloBordeDiscontinuo = { borderStyle: 'dashed' }

/**
 * Determina si un valor de autorización representa un "Sí".
 *  - Booleano      → se respeta tal cual.
 *  - "No autorizado" / "no_autorizado" → false.
 *  - "Autorizado"  → true.
 *  - Cualquier otra cosa → null (desconocido).
 */
const esAutorizado = (valor) => {
  if (typeof valor === 'boolean') return valor
  if (valor === null || valor === undefined) return null
  const texto = String(valor).trim().toLowerCase()
  if (!texto) return null
  if (/^no[\s_-]/.test(texto)) return false
  if (texto.includes('autorizad')) return true
  return null
}

const FilaDato = ({ icon, label, valor, valorClassName = '' }) => (
  <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
    <div className="d-flex align-items-center gap-2 text-body-secondary">
      <CIcon icon={icon} />
      <span>{label}</span>
    </div>
    <span className={`fw-bold text-end ${valorClassName}`}>{valor ?? '—'}</span>
  </div>
)

const FotoPersonaOVehiculo = ({ src, alt }) => {
  const [error, setError] = React.useState(false)
  if (!src || error) return null
  return (
    <img
      src={src}
      alt={alt}
      className="rounded border w-100"
      style={{ maxHeight: 160, objectFit: 'cover' }}
      onError={() => setError(true)}
    />
  )
}

const PlaceholderNeutro = ({ icon, texto }) => (
  <div
    className="d-flex align-items-center gap-2 p-3 rounded border text-body-secondary"
    style={estiloBordeDiscontinuo}
  >
    <CIcon icon={icon} className="opacity-50" />
    <span className="small">{texto}</span>
  </div>
)

/**
 * Columna derecha de "Monitoreo de entrada": banner de estado, tabla de
 * datos y, si el vehículo está registrado, su información y la de su
 * propietario. Todo lo que se muestra proviene de la respuesta del
 * endpoint OCR.
 */
const ResultadoReconocimiento = ({ estadoFlujo, resultado, mensajeError }) => {
  if (estadoFlujo === 'procesando') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center text-body-secondary py-5">
        <CSpinner color="success" className="mb-3" />
        <div>Analizando la imagen…</div>
      </div>
    )
  }

  if (estadoFlujo === 'error') {
    return (
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-2 p-3 rounded bg-danger-subtle text-danger-emphasis">
          <CIcon icon={cilWarning} />
          <span className="small">{mensajeError}</span>
        </div>
        <PlaceholderNeutro
          icon={cilCog}
          texto="No se pudo completar la solicitud al servicio de reconocimiento."
        />
      </div>
    )
  }

  if (estadoFlujo !== 'resultado' || !resultado) {
    return (
      <div className="d-flex flex-column gap-3">
        <PlaceholderNeutro
          icon={cilWarning}
          texto="El estado del vehículo (registrado / no registrado) se mostrará aquí."
        />
        <div className="border rounded overflow-hidden">
          {[
            { icon: cilDescription, label: 'Placa detectada' },
            { icon: cilSignalCellular3, label: 'Confianza OCR' },
            { icon: cilDescription, label: 'Estado' },
            { icon: cilCarAlt, label: 'Vehículo encontrado' },
          ].map((fila, indice, arreglo) => (
            <div
              key={fila.label}
              className={`d-flex justify-content-between align-items-center px-3 py-2 ${
                indice < arreglo.length - 1 ? 'border-bottom' : ''
              }`}
            >
              <div className="d-flex align-items-center gap-2 text-body-secondary">
                <CIcon icon={fila.icon} />
                <span>{fila.label}</span>
              </div>
              <span className="fw-bold text-body-tertiary">—</span>
            </div>
          ))}
        </div>
        <PlaceholderNeutro
          icon={cilWarning}
          texto="Se alertará aquí si la placa no existe en la base de datos."
        />
        <div
          className="d-flex align-items-center justify-content-between gap-2 p-3 rounded border text-body-secondary"
          style={estiloBordeDiscontinuo}
        >
          <div className="d-flex align-items-center gap-2">
            <CIcon icon={cilCog} className="opacity-50" />
            <div className="small">
              <div className="fw-semibold">API REST</div>
              <div>Esperando respuesta del servicio.</div>
            </div>
          </div>
          <CBadge color="secondary" shape="rounded-pill">
            Sin datos
          </CBadge>
        </div>
      </div>
    )
  }

  const clasificacion = clasificarEstado(resultado)
  const vehiculo = obtenerDatosVehiculo(resultado)
  const placa = vehiculo?.placa ?? resultado?.placa
  const confianza = formatearConfianza(vehiculo?.confianza ?? resultado?.confianza)
  const cedula = vehiculo?.cedula_enmascarada ?? vehiculo?.cedula ?? vehiculo?.cedula_propietario
  const fotografiaVehiculo =
    vehiculo?.fotografia_vehiculo ?? vehiculo?.foto_url ?? vehiculo?.fotografia ?? vehiculo?.foto
  const fotografiaPropietario = vehiculo?.fotografia_propietario ?? vehiculo?.foto_propietario_url
  const nombrePropietario =
    vehiculo?.nombre_propietario ?? vehiculo?.propietario_nombre ?? vehiculo?.propietario
  const autorizacion =
    vehiculo?.autorizacion ??
    (typeof vehiculo?.autorizado === 'boolean'
      ? vehiculo.autorizado
        ? 'Autorizado'
        : 'No autorizado'
      : null)

  const apiStatusCard = (
    <div className="d-flex align-items-center justify-content-between gap-2 p-3 rounded border-success-subtle bg-success-subtle text-success-emphasis">
      <div className="d-flex align-items-center gap-2">
        <CIcon icon={cilCog} />
        <div className="small">
          <div className="fw-semibold">API REST</div>
          <div>Respuesta recibida correctamente</div>
        </div>
      </div>
      <CIcon icon={cilCheckCircle} />
    </div>
  )

  if (clasificacion === 'encontrado') {
    const autorizado = esAutorizado(autorizacion)

    return (
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-2 p-3 rounded bg-success text-white">
          <CIcon icon={cilCheckCircle} size="lg" />
          <span className="fw-bold text-uppercase">Vehículo registrado</span>
        </div>

        <div className="border rounded overflow-hidden">
          <FilaDato icon={cilDescription} label="Placa reconocida" valor={placa} />
          <FilaDato icon={cilSignalCellular3} label="Confianza" valor={confianza} />
          <FilaDato icon={cilCarAlt} label="Marca" valor={vehiculo?.marca} />
          <FilaDato icon={cilCarAlt} label="Modelo" valor={vehiculo?.modelo} />
          <FilaDato icon={cilCarAlt} label="Año" valor={vehiculo?.año ?? vehiculo?.anio} />
          <FilaDato icon={cilCarAlt} label="Color" valor={vehiculo?.color} />
          <FilaDato icon={cilCarAlt} label="Tipo de vehículo" valor={vehiculo?.tipo} />
          <FilaDato icon={cilContact} label="Propietario" valor={nombrePropietario} />
          <FilaDato icon={cilContact} label="Cédula" valor={enmascararCedula(cedula)} />
          <div className="d-flex justify-content-between align-items-center px-3 py-2">
            <div className="d-flex align-items-center gap-2 text-body-secondary">
              <CIcon icon={cilCheckCircle} />
              <span>Autorización</span>
            </div>
            {autorizacion ? (
              <CBadge color={autorizado === false ? 'danger' : 'success'}>{autorizacion}</CBadge>
            ) : (
              <span className="fw-bold text-body-tertiary">—</span>
            )}
          </div>
        </div>

        {(fotografiaVehiculo || fotografiaPropietario) && (
          <div className="d-flex gap-2 flex-wrap">
            <div className="flex-fill" style={{ minWidth: 140 }}>
              <div className="small text-body-secondary mb-1">Vehículo</div>
              <FotoPersonaOVehiculo src={fotografiaVehiculo} alt="Fotografía del vehículo" />
            </div>
            <div className="flex-fill" style={{ minWidth: 140 }}>
              <div className="small text-body-secondary mb-1">Propietario</div>
              <FotoPersonaOVehiculo src={fotografiaPropietario} alt="Fotografía del propietario" />
            </div>
          </div>
        )}

        {apiStatusCard}
      </div>
    )
  }

  if (clasificacion === 'no_registrado') {
    return (
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-2 p-3 rounded bg-danger text-white">
          <CIcon icon={cilWarning} size="lg" />
          <span className="fw-bold text-uppercase">Vehículo no registrado</span>
        </div>

        <div className="border rounded overflow-hidden">
          <FilaDato icon={cilDescription} label="Placa detectada" valor={placa} />
          <div className="d-flex justify-content-between align-items-center px-3 py-2">
            <div className="d-flex align-items-center gap-2 text-body-secondary">
              <CIcon icon={cilSignalCellular3} />
              <span>Confianza OCR</span>
            </div>
            <span className="fw-bold">{confianza ?? '—'}</span>
          </div>
        </div>

        <div className="d-flex align-items-start gap-2 p-3 rounded bg-danger-subtle text-danger-emphasis">
          <CIcon icon={cilWarning} className="mt-1" />
          <div className="small">
            <div className="fw-semibold">Ingreso no autorizado</div>
            <div>La placa no fue encontrada en la base de datos consultada por el servicio.</div>
          </div>
        </div>

        {apiStatusCard}
      </div>
    )
  }

  const mensajesReintentables = {
    sin_placa: 'No se detectó una placa en la imagen.',
    baja_confianza: 'La imagen debe capturarse nuevamente (baja confianza en la detección).',
    multiples_placas: 'Se detectaron varias placas en la imagen.',
  }

  if (mensajesReintentables[clasificacion]) {
    return (
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-2 p-3 rounded bg-warning-subtle text-warning-emphasis">
          <CIcon icon={cilWarning} />
          <span className="small">{mensajesReintentables[clasificacion]}</span>
        </div>
        <PlaceholderNeutro
          icon={cilCarAlt}
          texto="Capture o suba otra imagen para intentar de nuevo."
        />
        {apiStatusCard}
      </div>
    )
  }

  // Estado no documentado: se muestra la respuesta cruda sin asumir nada.
  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center gap-2 p-3 rounded bg-secondary-subtle text-body-secondary">
        <CIcon icon={cilXCircle} />
        <span className="small">
          Estado de respuesta no reconocido:{' '}
          <strong>{String(resultado?.estado ?? 'desconocido')}</strong>
        </span>
      </div>
      {apiStatusCard}
    </div>
  )
}

export default ResultadoReconocimiento