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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

export const ESTADOS_PUESTO = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'OCUPADO', label: 'Ocupado' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
]

const FORMULARIO_VACIO = {
  codigo: '',
  columna: '',
  numero: '',
  sensor_id_rtdb: '',
  ruta_firebase: '',
  estado: 'DISPONIBLE',
}

const validarFormularioPuesto = (formulario) => {
  const errores = {}

  if (!formulario.codigo.trim()) {
    errores.codigo = 'El código del puesto es obligatorio.'
  }

  if (!formulario.columna.trim()) {
    errores.columna = 'La columna es obligatoria.'
  } else if (formulario.columna.trim().length > 1) {
    errores.columna = 'La columna debe ser un solo carácter.'
  }

  if (!formulario.numero.toString().trim()) {
    errores.numero = 'El número de puesto es obligatorio.'
  } else if (Number.isNaN(Number(formulario.numero))) {
    errores.numero = 'El número debe ser numérico.'
  }

  if (!formulario.estado) {
    errores.estado = 'Seleccione un estado.'
  }

  return errores
}

const PuestoFormModal = ({ visible, puesto, guardando, onClose, onGuardar }) => {
  const esEdicion = Boolean(puesto)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!visible) return

    if (puesto) {
      setFormulario({
        codigo: puesto.codigo || '',
        columna: puesto.columna || '',
        numero: puesto.numero ?? '',
        sensor_id_rtdb: puesto.sensor_id_rtdb || '',
        ruta_firebase: puesto.ruta_firebase || '',
        estado: puesto.estado || 'DISPONIBLE',
      })
    } else {
      setFormulario(FORMULARIO_VACIO)
    }

    setErrores({})
    setErrorGeneral('')
  }, [visible, puesto])
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

    const erroresValidacion = validarFormularioPuesto(formulario)
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    const datosNormalizados = {
      codigo: formulario.codigo.trim(),
      columna: formulario.columna.trim(),
      numero: Number(formulario.numero),
      sensor_id_rtdb: formulario.sensor_id_rtdb.trim() || null,
      ruta_firebase: formulario.ruta_firebase.trim() || null,
      estado: formulario.estado,
    }

    const resultado = esEdicion
      ? await onGuardar(puesto.id, datosNormalizados)
      : await onGuardar(datosNormalizados)

    if (!resultado?.exito) {
      setErrorGeneral(resultado?.mensaje || 'No se pudo guardar el puesto. Intente nuevamente.')
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
          <CModalTitle>{esEdicion ? 'Editar puesto' : 'Agregar puesto'}</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {errorGeneral && <CAlert color="danger">{errorGeneral}</CAlert>}

          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel htmlFor="codigo">Código</CFormLabel>
              <CFormInput
                id="codigo"
                placeholder="A-01"
                value={formulario.codigo}
                invalid={Boolean(errores.codigo)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('codigo', e.target.value)}
              />
              <CFormFeedback invalid>{errores.codigo}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="columna">Columna</CFormLabel>
              <CFormInput
                id="columna"
                placeholder="A"
                maxLength={1}
                value={formulario.columna}
                invalid={Boolean(errores.columna)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('columna', e.target.value.toUpperCase())}
              />
              <CFormFeedback invalid>{errores.columna}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="numero">Número</CFormLabel>
              <CFormInput
                id="numero"
                type="number"
                value={formulario.numero}
                invalid={Boolean(errores.numero)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('numero', e.target.value)}
              />
              <CFormFeedback invalid>{errores.numero}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="sensor_id_rtdb">ID del sensor (Firebase RTDB)</CFormLabel>
              <CFormInput
                id="sensor_id_rtdb"
                placeholder="sensor_01"
                value={formulario.sensor_id_rtdb}
                invalid={Boolean(errores.sensor_id_rtdb)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('sensor_id_rtdb', e.target.value)}
              />
              <CFormFeedback invalid>{errores.sensor_id_rtdb}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="ruta_firebase">Ruta en Firebase</CFormLabel>
              <CFormInput
                id="ruta_firebase"
                placeholder="/puestos/A01"
                value={formulario.ruta_firebase}
                invalid={Boolean(errores.ruta_firebase)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('ruta_firebase', e.target.value)}
              />
              <CFormFeedback invalid>{errores.ruta_firebase}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="estado">Estado</CFormLabel>
              <CFormSelect
                id="estado"
                value={formulario.estado}
                invalid={Boolean(errores.estado)}
                disabled={guardando}
                onChange={(e) => actualizarCampo('estado', e.target.value)}
              >
                {ESTADOS_PUESTO.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </CFormSelect>
              <CFormFeedback invalid>{errores.estado}</CFormFeedback>
            </CCol>
          </CRow>

          {esEdicion && (
            <CRow className="g-3 mt-1">
              <CCol md={6}>
                <small className="text-body-secondary">
                  Distancia del sensor: <strong>{puesto.distancia_cm ?? '—'} cm</strong>
                </small>
              </CCol>
              <CCol md={6}>
                <small className="text-body-secondary">
                  Última actualización:{' '}
                  <strong>
                    {puesto.ultima_actualizacion
                      ? new Date(puesto.ultima_actualizacion).toLocaleString()
                      : '—'}
                  </strong>
                </small>
              </CCol>
            </CRow>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" disabled={guardando} onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={guardando}>
            {guardando && <CSpinner size="sm" className="me-2" />}
            {esEdicion ? 'Guardar cambios' : 'Registrar puesto'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

PuestoFormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  puesto: PropTypes.object,
  guardando: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onGuardar: PropTypes.func.isRequired,
}

export default PuestoFormModal