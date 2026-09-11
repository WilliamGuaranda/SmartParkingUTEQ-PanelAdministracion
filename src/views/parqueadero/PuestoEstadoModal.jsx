import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'

import { useVehiculos } from '../../hooks/useVehiculos'

/**
 * Modal para marcar un puesto como Ocupado o como Libre.
 */
const PuestoEstadoModal = ({ visible, puesto, onOcupar, onLiberar, onCerrar }) => {
  const { vehiculos } = useVehiculos()
  const [vehiculoId, setVehiculoId] = useState('')
  const [distancia, setDistancia] = useState('')
  const [observacion, setObservacion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const puestoLibre = puesto?.estado === 'DISPONIBLE'

  useEffect(() => {
    if (visible) {
      setVehiculoId('')
      setDistancia(puesto?.distancia_cm ?? '')
      setObservacion('')
      setError('')
    }
  }, [visible, puesto])

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')

    const distanciaCm = distancia === '' ? null : Number(distancia)

    setGuardando(true)
    try {
      if (puestoLibre) {
        const vehiculo = vehiculos.find((v) => String(v.id) === String(vehiculoId))
        if (!vehiculo) {
          setError('Seleccione el vehículo que ocupa el puesto.')
          setGuardando(false)
          return
        }
        await onOcupar({
          vehiculoId: vehiculo.id,
          placa: vehiculo.placa,
          distanciaCm,
          observacion,
        })
      } else {
        await onLiberar({ distanciaCm, observacion })
      }
    } catch (errorGuardado) {
      setError(errorGuardado.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onCerrar} alignment="center">
      <CForm onSubmit={manejarEnvio}>
        <CModalHeader closeButton>
          <CModalTitle>
            {puestoLibre ? 'Marcar ocupado' : 'Marcar libre'} — puesto {puesto?.codigo}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          {puestoLibre && (
            <div className="mb-3">
              <CFormLabel>Vehículo (placa)</CFormLabel>
              <CFormSelect value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)}>
                <option value="">Seleccione un vehículo...</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.propietario_nombre}
                  </option>
                ))}
              </CFormSelect>
            </div>
          )}

          <div className="mb-3">
            <CFormLabel>Distancia detectada (cm)</CFormLabel>
            <CFormInput
              type="number"
              step="0.1"
              value={distancia}
              onChange={(e) => setDistancia(e.target.value)}
            />
          </div>

          <div>
            <CFormLabel>Observación</CFormLabel>
            <CFormTextarea
              rows={2}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </CButton>
          <CButton color={puestoLibre ? 'danger' : 'success'} type="submit" disabled={guardando}>
            {guardando ? <CSpinner size="sm" /> : puestoLibre ? 'Marcar ocupado' : 'Marcar libre'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default PuestoEstadoModal