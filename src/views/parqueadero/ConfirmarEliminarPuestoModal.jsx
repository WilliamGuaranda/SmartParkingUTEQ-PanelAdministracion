import React from 'react'
import PropTypes from 'prop-types'
import {
  CAlert,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'

const ConfirmarEliminarPuestoModal = ({
  visible,
  puesto,
  eliminando,
  error,
  onCancelar,
  onConfirmar,
}) => (
  <CModal
    alignment="center"
    visible={visible}
    onClose={eliminando ? undefined : onCancelar}
    backdrop="static"
  >
    <CModalHeader closeButton={!eliminando}>
      <CModalTitle>Eliminar puesto</CModalTitle>
    </CModalHeader>

    <CModalBody>
      {error && <CAlert color="danger">{error}</CAlert>}

      {puesto && (
        <p>
          ¿Está seguro de eliminar el puesto <strong>{puesto.codigo}</strong> (columna{' '}
          {puesto.columna}, número {puesto.numero})? Esta acción no se puede deshacer.
        </p>
      )}
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" variant="outline" disabled={eliminando} onClick={onCancelar}>
        Cancelar
      </CButton>
      <CButton color="danger" disabled={eliminando} onClick={onConfirmar}>
        {eliminando && <CSpinner size="sm" className="me-2" />}
        Eliminar
      </CButton>
    </CModalFooter>
  </CModal>
)

ConfirmarEliminarPuestoModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  puesto: PropTypes.object,
  eliminando: PropTypes.bool,
  error: PropTypes.string,
  onCancelar: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
}

export default ConfirmarEliminarPuestoModal