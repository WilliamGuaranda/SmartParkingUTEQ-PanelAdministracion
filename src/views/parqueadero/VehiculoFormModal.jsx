import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

import {
  TIPOS_VEHICULO,
  normalizarPlaca,
  validarFormularioVehiculo,
} from '../../utils/validarVehiculo'

const FORMULARIO_VACIO = {
  placa: '',
  marca: '',
  modelo: '',
  anio: '',
  color: '',
  tipo: '',
  propietario_nombre: '',
  cedula: '',
  correo_institucional: '',
  foto_url: '',
  foto_fuente_url: '',
  foto_propietario_url: '',
  autorizado: true,
}

const VehiculoFormModal = ({ visible, vehiculo, guardando, onClose, onGuardar }) => {
  const esEdicion = Boolean(vehiculo)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')

  // Sincroniza el formulario con el vehículo recibido cada vez que el modal
  // se abre (creación en blanco o edición con datos existentes). Es un uso
  // legítimo de useEffect para reflejar una prop externa en estado local.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!visible) return

    if (vehiculo) {
      setFormulario({
        placa: vehiculo.placa || '',
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        anio: vehiculo.anio || '',
        color: vehiculo.color || '',
        tipo: vehiculo.tipo || '',
        propietario_nombre: vehiculo.propietario_nombre || '',
        cedula: '',
        correo_institucional: vehiculo.correo_institucional || '',
        foto_url: vehiculo.foto_url || '',
        foto_fuente_url: vehiculo.foto_fuente_url || '',
        foto_propietario_url: vehiculo.foto_propietario_url || '',
        autorizado: vehiculo.autorizado ?? true,
      })
    } else {
      setFormulario(FORMULARIO_VACIO)
    }

    setErrores({})
    setErrorGeneral('')
  }, [visible, vehiculo])
  /* eslint-enable react-hooks/set-state-in-effect */

  const actualizarCampo = (campo, valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
    if (errores[campo]) {
      setErrores((anterior) => {
        const copia = { ...anterior }
        delete copia[campo]
        return copia
      })
    }
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setErrorGeneral('')

    const erroresValidacion = validarFormularioVehiculo(formulario, esEdicion)
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    const datosNormalizados = {
      placa: normalizarPlaca(formulario.placa),
      marca: formulario.marca.trim(),
      modelo: formulario.modelo.trim(),
      anio: Number(formulario.anio),
      color: formulario.color.trim(),
      tipo: formulario.tipo,
      propietario_nombre: formulario.propietario_nombre.trim(),
      correo_institucional: formulario.correo_institucional.trim(),
      foto_url: formulario.foto_url.trim() || null,
      foto_fuente_url: formulario.foto_fuente_url.trim() || null,
      foto_propietario_url: formulario.foto_propietario_url.trim() || null,
      autorizado: formulario.autorizado,
    }

    if (formulario.cedula.trim()) {
      datosNormalizados.cedula_propietario = formulario.cedula.trim()
    }

    const resultado = esEdicion
      ? await onGuardar(vehiculo.id, datosNormalizados)
      : await onGuardar(datosNormalizados)

    if (!resultado?.exito) {
      setErrorGeneral(resultado?.mensaje || 'No se pudo guardar el vehículo. Intente nuevamente.')
    }
  }

  return (
    <CModal
      alignment="center"
      visible={visible}
      onClose={guardando ? undefined : onClose}
      backdrop="static"
    >
      <CForm onSubmit={manejarEnvio} noValidate>
        <CModalHeader closeButton={!guardando}>
          <CModalTitle>{esEdicion ? 'Editar vehículo' : 'Agregar vehículo'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {errorGeneral && <CAlert color="danger">{errorGeneral}</CAlert>}

          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel htmlFor="placa">Placa</CFormLabel>
              <CFormInput
                id="placa"
                placeholder="ABC-1234"
                value={formulario.placa}
                invalid={Boolean(errores.placa)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('placa', e.target.value)}
              />
              <CFormFeedback invalid>{errores.placa}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="marca">Marca</CFormLabel>
              <CFormInput
                id="marca"
                value={formulario.marca}
                invalid={Boolean(errores.marca)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('marca', e.target.value)}
              />
              <CFormFeedback invalid>{errores.marca}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="modelo">Modelo</CFormLabel>
              <CFormInput
                id="modelo"
                value={formulario.modelo}
                invalid={Boolean(errores.modelo)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('modelo', e.target.value)}
              />
              <CFormFeedback invalid>{errores.modelo}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="anio">Año</CFormLabel>
              <CFormInput
                id="anio"
                type="number"
                value={formulario.anio}
                invalid={Boolean(errores.anio)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('anio', e.target.value)}
              />
              <CFormFeedback invalid>{errores.anio}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="color">Color</CFormLabel>
              <CFormInput
                id="color"
                value={formulario.color}
                invalid={Boolean(errores.color)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('color', e.target.value)}
              />
              <CFormFeedback invalid>{errores.color}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="tipo">Tipo</CFormLabel>
              <CFormSelect
                id="tipo"
                value={formulario.tipo}
                invalid={Boolean(errores.tipo)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('tipo', e.target.value)}
              >
                <option value="">Seleccione...</option>
                {TIPOS_VEHICULO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </CFormSelect>
              <CFormFeedback invalid>{errores.tipo}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="propietario_nombre">Nombre del propietario</CFormLabel>
              <CFormInput
                id="propietario_nombre"
                value={formulario.propietario_nombre}
                invalid={Boolean(errores.propietario_nombre)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('propietario_nombre', e.target.value)}
              />
              <CFormFeedback invalid>{errores.propietario_nombre}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="cedula">
                Cédula{' '}
                {esEdicion && (
                  <small className="text-body-secondary">(dejar en blanco para no cambiarla)</small>
                )}
              </CFormLabel>
              <CFormInput
                id="cedula"
                maxLength={10}
                placeholder={esEdicion ? 'Sin cambios' : '10 dígitos'}
                value={formulario.cedula}
                invalid={Boolean(errores.cedula)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('cedula', e.target.value.replace(/\D/g, ''))}
              />
              <CFormFeedback invalid>{errores.cedula}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="correo_institucional">Correo institucional</CFormLabel>
              <CFormInput
                id="correo_institucional"
                type="email"
                placeholder="nombre@uteq.edu.ec"
                value={formulario.correo_institucional}
                invalid={Boolean(errores.correo_institucional)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('correo_institucional', e.target.value)}
              />
              <CFormFeedback invalid>{errores.correo_institucional}</CFormFeedback>
            </CCol>

            <CCol md={6} className="d-flex align-items-end">
              <CFormSwitch
                id="autorizado"
                label="Vehículo autorizado"
                checked={formulario.autorizado}
                disabled={guardando}
                onChange={(e) => actualizarCampo('autorizado', e.target.checked)}
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="foto_url">URL foto del vehículo</CFormLabel>
              <CFormInput
                id="foto_url"
                placeholder="https://..."
                value={formulario.foto_url}
                invalid={Boolean(errores.foto_url)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('foto_url', e.target.value)}
              />
              <CFormFeedback invalid>{errores.foto_url}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="foto_fuente_url">URL fuente de la imagen</CFormLabel>
              <CFormInput
                id="foto_fuente_url"
                placeholder="https://..."
                value={formulario.foto_fuente_url}
                invalid={Boolean(errores.foto_fuente_url)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('foto_fuente_url', e.target.value)}
              />
              <CFormFeedback invalid>{errores.foto_fuente_url}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="foto_propietario_url">URL foto del propietario</CFormLabel>
              <CFormInput
                id="foto_propietario_url"
                placeholder="https://..."
                value={formulario.foto_propietario_url}
                invalid={Boolean(errores.foto_propietario_url)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('foto_propietario_url', e.target.value)}
              />
              <CFormFeedback invalid>{errores.foto_propietario_url}</CFormFeedback>
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" disabled={guardando} onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={guardando}>
            {guardando && <CSpinner size="sm" className="me-2" />}
            {esEdicion ? 'Guardar cambios' : 'Registrar vehículo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

VehiculoFormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  vehiculo: PropTypes.object,
  guardando: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onGuardar: PropTypes.func.isRequired,
}

export default VehiculoFormModal
