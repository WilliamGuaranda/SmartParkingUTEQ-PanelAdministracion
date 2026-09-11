import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

const VALORES_INICIALES = {
  codigo: '',
  columna: '',
  numero: '',
  sensor_id_rtdb: '',
  ruta_firebase: '',
}

/**
 * Modal con formulario para crear o editar un puesto de parqueo.
 */
const PuestoFormModal = ({ visible, puesto, onGuardar, onCerrar }) => {
  const [form, setForm] = useState(VALORES_INICIALES)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const esEdicion = Boolean(puesto)

  useEffect(() => {
    if (visible) {
      setForm(puesto ? { ...VALORES_INICIALES, ...puesto } : VALORES_INICIALES)
      setError('')
    }
  }, [visible, puesto])

  const manejarCambio = (campo) => (evento) => {
    setForm((anterior) => ({ ...anterior, [campo]: evento.target.value }))
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')

    if (!form.codigo || !form.columna || !form.numero) {
      setError('Complete al menos código, columna y número.')
      return
    }

    const datos = {
      codigo: form.codigo.trim().toUpperCase(),
      columna: form.columna.trim().toUpperCase(),
      numero: Number(form.numero),
      sensor_id_rtdb: form.sensor_id_rtdb || null,
      ruta_firebase: form.ruta_firebase || null,
    }

    setGuardando(true)
    try {
      await onGuardar(datos)
    } catch (errorGuardado) {
      setError(errorGuardado.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onCerrar} size="lg" alignment="center">
      <CForm onSubmit={manejarEnvio}>
        <CModalHeader closeButton>
          <CModalTitle>{esEdicion ? 'Editar puesto' : 'Nuevo puesto'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>Código *</CFormLabel>
              <CFormInput
                placeholder="A01"
                value={form.codigo}
                onChange={manejarCambio('codigo')}
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Columna *</CFormLabel>
              <CFormInput
                placeholder="A"
                maxLength={1}
                value={form.columna}
                onChange={manejarCambio('columna')}
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Número *</CFormLabel>
              <CFormInput
                type="number"
                min={1}
                value={form.numero}
                onChange={manejarCambio('numero')}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Sensor ID (RTDB)</CFormLabel>
              <CFormInput
                placeholder="parking_A_01"
                value={form.sensor_id_rtdb ?? ''}
                onChange={manejarCambio('sensor_id_rtdb')}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Ruta Firebase</CFormLabel>
              <CFormInput
                placeholder="/parqueadero/..."
                value={form.ruta_firebase ?? ''}
                onChange={manejarCambio('ruta_firebase')}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={guardando}>
            {guardando ? <CSpinner size="sm" /> : esEdicion ? 'Guardar cambios' : 'Crear puesto'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default PuestoFormModal