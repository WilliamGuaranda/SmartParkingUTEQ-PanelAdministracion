import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

const VALORES_INICIALES = {
  placa: '',
  marca: '',
  modelo: '',
  anio: '',
  color: '',
  tipo: '',
  foto_url: '',
  foto_fuente_url: '',
  foto_propietario_url: '',
  cedula_propietario: '',
  propietario_nombre: '',
  correo_institucional: '',
  autorizado: true,
  activo: true,
}

/**
 * Modal con formulario para crear o editar un vehículo.
 */
const VehiculoFormModal = ({ visible, vehiculo, onGuardar, onCerrar }) => {
  const [form, setForm] = useState(VALORES_INICIALES)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const esEdicion = Boolean(vehiculo)

  useEffect(() => {
    if (visible) {
      setForm(vehiculo ? { ...VALORES_INICIALES, ...vehiculo } : VALORES_INICIALES)
      setError('')
    }
  }, [visible, vehiculo])

  const manejarCambio = (campo) => (evento) => {
    let valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value

    if (campo === 'placa' && typeof valor === 'string') {
      valor = valor.toUpperCase()
    }

    if (campo === 'cedula_propietario' && typeof valor === 'string') {
      valor = valor.replace(/\D/g, '')
    }

    setForm((anterior) => ({ ...anterior, [campo]: valor }))
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')

    if (
      !form.placa ||
      !form.marca ||
      !form.modelo ||
      !form.propietario_nombre ||
      !form.cedula_propietario
    ) {
      setError('Complete al menos la placa, marca, modelo, cédula y nombre del propietario.')
      return
    }

    const datos = {
      ...form,
      anio: form.anio === '' || form.anio === null ? null : Number(form.anio),
    }

    delete datos.id
    delete datos.cedula_enmascarada
    delete datos.activo

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
          <CModalTitle>{esEdicion ? 'Editar vehículo' : 'Nuevo vehículo'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>Placa *</CFormLabel>
              <CFormInput value={form.placa ?? ''} onChange={manejarCambio('placa')} required />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Marca *</CFormLabel>
              <CFormInput value={form.marca ?? ''} onChange={manejarCambio('marca')} required />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Modelo *</CFormLabel>
              <CFormInput value={form.modelo ?? ''} onChange={manejarCambio('modelo')} required />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Año</CFormLabel>
              <CFormInput type="number" value={form.anio ?? ''} onChange={manejarCambio('anio')} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Color</CFormLabel>
              <CFormInput value={form.color ?? ''} onChange={manejarCambio('color')} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Tipo</CFormLabel>
              <CFormSelect value={form.tipo ?? ''} onChange={manejarCambio('tipo')}>
                <option value="">Seleccione...</option>
                <option value="AUTOMOVIL">Automóvil</option>
                <option value="MOTOCICLETA">Motocicleta</option>
                <option value="CAMIONETA">Camioneta</option>
                <option value="BUS">Bus</option>
              </CFormSelect>
            </CCol>

            <CCol md={6}>
              <CFormLabel>Foto del vehículo (URL)</CFormLabel>
              <CFormInput value={form.foto_url ?? ''} onChange={manejarCambio('foto_url')} />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Fuente de la foto (URL)</CFormLabel>
              <CFormInput
                value={form.foto_fuente_url ?? ''}
                onChange={manejarCambio('foto_fuente_url')}
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Foto del propietario (URL)</CFormLabel>
              <CFormInput
                value={form.foto_propietario_url ?? ''}
                onChange={manejarCambio('foto_propietario_url')}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Cédula del propietario *</CFormLabel>
              <CFormInput
                value={form.cedula_propietario ?? ''}
                onChange={manejarCambio('cedula_propietario')}
                placeholder="Ej. 1723456789"
                maxLength={10}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Nombre del propietario *</CFormLabel>
              <CFormInput
                value={form.propietario_nombre ?? ''}
                onChange={manejarCambio('propietario_nombre')}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Correo institucional</CFormLabel>
              <CFormInput
                type="email"
                value={form.correo_institucional ?? ''}
                onChange={manejarCambio('correo_institucional')}
              />
            </CCol>

            <CCol md={12}>
              <CFormCheck
                checked={Boolean(form.autorizado)}
                onChange={manejarCambio('autorizado')}
                label="Vehículo autorizado"
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={guardando}>
            {guardando ? <CSpinner size="sm" /> : esEdicion ? 'Guardar cambios' : 'Crear vehículo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default VehiculoFormModal