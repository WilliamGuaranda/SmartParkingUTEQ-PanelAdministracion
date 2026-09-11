/**
 * ============================================================================
 *  Componente: ResultadoOcr
 * ============================================================================
 *  Presenta el JSON devuelto por el endpoint de reconocimiento de placas.
 *
 *  Estados cubiertos
 *  -----------------
 *   encontrado        → banner verde + datos + fotos + autorización
 *   no_registrado     → banner rojo + "no existe en Supabase"
 *   sin_placa         → banner amarillo
 *   baja_confianza    → banner amarillo
 *   multiples_placas  → banner amarillo
 *   (desconocido)     → alerta neutra
 *
 *  Reglas de honestidad de datos
 *  -----------------------------
 *   - NUNCA inventamos valores: si un campo no viene, se muestra "—".
 *   - `campo()` prueba varias claves candidatas porque el nombre exacto
 *     en la respuesta del endpoint puede variar.
 *   - La cédula se muestra SIEMPRE enmascarada.
 * ============================================================================
 */
import React from 'react'
import { CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBan,
  cilCarAlt,
  cilCheckCircle,
  cilReload,
  cilShieldAlt,
  cilWarning,
  cilXCircle,
} from '@coreui/icons'

const campo = (objeto, claves) => {
  if (!objeto) return null
  for (const clave of claves) {
    const valor = objeto[clave]
    if (valor !== undefined && valor !== null && valor !== '') return valor
  }
  return null
}

const formatearConfianza = (valor) => {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return null
  const numero = Number(valor)
  const porcentaje = numero <= 1 ? numero * 100 : numero
  return `${porcentaje.toLocaleString('es-EC', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`
}

const FilaResultado = ({ icono, etiqueta, valor }) => (
  <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center gap-2 text-body-secondary">
      <CIcon icon={icono} />
      <span>{etiqueta}</span>
    </div>
    <strong>{valor}</strong>
  </div>
)

const Banner = ({ color, icono, texto }) => (
  <div className={`bg-${color} text-white rounded p-3 mb-3 d-flex align-items-center gap-2`}>
    <CIcon icon={icono} size="xl" />
    <strong>{texto}</strong>
  </div>
)

const MENSAJES_ESTADO = {
  sin_placa: {
    color: 'warning',
    icono: cilWarning,
    titulo: 'NO SE DETECTÓ NINGUNA PLACA',
    detalle: 'No fue posible ubicar una placa en la imagen. Intente capturarla nuevamente.',
  },
  baja_confianza: {
    color: 'warning',
    icono: cilWarning,
    titulo: 'CONFIANZA BAJA',
    detalle:
      'El nivel de confianza del reconocimiento es muy bajo. Vuelva a capturar la imagen con mejor iluminación y enfoque.',
  },
  multiples_placas: {
    color: 'warning',
    icono: cilWarning,
    titulo: 'SE DETECTARON VARIAS PLACAS',
    detalle:
      'La imagen contiene más de una placa visible. Capture una imagen con un solo vehículo.',
  },
}

const ResultadoOcr = ({ resultado, onProcesarOtra }) => {
  const estado = resultado?.estado
  const vehiculo = resultado?.vehiculo || {}

  const placa = campo(resultado, ['placa']) ?? campo(vehiculo, ['placa'])
  const confianza = formatearConfianza(
    campo(resultado, ['confianza', 'confidence', 'ocr_confianza']),
  )
  const vehiculoEncontrado = resultado?.vehiculo_encontrado

  const imagenMarcada = resultado?.imagen_marcada
    ? `data:${resultado.imagen_marcada.mime_type};base64,${resultado.imagen_marcada.base64}`
    : null

  const marca = campo(vehiculo, ['marca'])
  const modelo = campo(vehiculo, ['modelo'])
  const anio = campo(vehiculo, ['anio', 'año', 'year'])
  const color = campo(vehiculo, ['color'])
  const tipo = campo(vehiculo, ['tipo', 'tipo_vehiculo'])
  const propietario = campo(vehiculo, ['propietario_nombre', 'nombre_propietario', 'propietario'])
  const cedula = campo(vehiculo, ['cedula_enmascarada', 'cedula'])
  const autorizado = campo(vehiculo, ['autorizado'])
  const fotoVehiculo = campo(vehiculo, ['foto_vehiculo_url', 'foto_url', 'foto_vehiculo'])
  const fotoPropietario = campo(vehiculo, ['foto_propietario_url', 'foto_propietario'])

  return (
    <div>
      {imagenMarcada && (
        <img
          src={imagenMarcada}
          alt="Vehículo con placa detectada"
          className="img-fluid rounded border mb-3"
          style={{ maxHeight: '260px', objectFit: 'contain', width: '100%' }}
        />
      )}

      {estado === 'encontrado' && (
        <Banner color="success" icono={cilCheckCircle} texto="VEHÍCULO ENCONTRADO" />
      )}
      {estado === 'no_registrado' && (
        <Banner color="danger" icono={cilXCircle} texto="VEHÍCULO NO REGISTRADO" />
      )}
      {MENSAJES_ESTADO[estado] && (
        <Banner
          color={MENSAJES_ESTADO[estado].color}
          icono={MENSAJES_ESTADO[estado].icono}
          texto={MENSAJES_ESTADO[estado].titulo}
        />
      )}

      <div className="mb-3">
        <FilaResultado icono={cilCarAlt} etiqueta="Placa detectada" valor={placa || '—'} />
        <FilaResultado icono={cilShieldAlt} etiqueta="Confianza OCR" valor={confianza || '—'} />
        <FilaResultado icono={cilCheckCircle} etiqueta="Estado" valor={estado || '—'} />
        <FilaResultado
          icono={cilBan}
          etiqueta="Vehículo encontrado"
          valor={vehiculoEncontrado ? 'Sí' : 'No'}
        />
      </div>

      {estado === 'encontrado' && (
        <>
          <div className="mb-3">
            <FilaResultado icono={cilCarAlt} etiqueta="Marca" valor={marca || '—'} />
            <FilaResultado icono={cilCarAlt} etiqueta="Modelo" valor={modelo || '—'} />
            <FilaResultado icono={cilCarAlt} etiqueta="Año" valor={anio || '—'} />
            <FilaResultado icono={cilCarAlt} etiqueta="Color" valor={color || '—'} />
            <FilaResultado icono={cilCarAlt} etiqueta="Tipo" valor={tipo || '—'} />
            <FilaResultado icono={cilShieldAlt} etiqueta="Propietario" valor={propietario || '—'} />
            <FilaResultado icono={cilShieldAlt} etiqueta="Cédula" valor={cedula || '—'} />
            <div className="d-flex justify-content-between align-items-center py-2">
              <div className="d-flex align-items-center gap-2 text-body-secondary">
                <CIcon icon={cilShieldAlt} />
                <span>Autorización</span>
              </div>
              <CBadge color={autorizado ? 'success' : 'danger'}>
                {autorizado ? 'Autorizado' : 'No autorizado'}
              </CBadge>
            </div>
          </div>

          {(fotoVehiculo || fotoPropietario) && (
            <div className="d-flex gap-3 flex-wrap mb-3">
              {fotoVehiculo && (
                <div>
                  <div className="small text-body-secondary mb-1">Fotografía del vehículo</div>
                  <img
                    src={fotoVehiculo}
                    alt="Fotografía del vehículo registrado"
                    width="140"
                    height="90"
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              )}
              {fotoPropietario && (
                <div>
                  <div className="small text-body-secondary mb-1">Fotografía del propietario</div>
                  <img
                    src={fotoPropietario}
                    alt={`Fotografía de ${propietario || 'propietario'}`}
                    width="90"
                    height="90"
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {estado === 'no_registrado' && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <CIcon icon={cilBan} />
          <span>La placa no existe en la base de datos de Supabase. Ingreso no autorizado.</span>
        </div>
      )}

      {MENSAJES_ESTADO[estado] && (
        <div className={`alert alert-${MENSAJES_ESTADO[estado].color}`}>
          {MENSAJES_ESTADO[estado].detalle}
        </div>
      )}

      {!estado && (
        <div className="alert alert-secondary">
          El servicio respondió sin un estado reconocido. Revise la respuesta del endpoint.
        </div>
      )}

      <CButton color="secondary" variant="outline" onClick={onProcesarOtra}>
        <CIcon icon={cilReload} className="me-1" />
        Procesar otra imagen
      </CButton>
    </div>
  )
}

export default ResultadoOcr