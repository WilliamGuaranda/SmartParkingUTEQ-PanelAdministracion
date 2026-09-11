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

const ConfirmarEliminarModal = ({
  visible,
  vehiculo,
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
      <CModalTitle>Eliminar vehículo</CModalTitle>
    </CModalHeader>

    <CModalBody>
      {error && <CAlert color="danger">{error}</CAlert>}

      {vehiculo && (
        <p>
          ¿Está seguro de eliminar el vehículo con placa <strong>{vehiculo.placa}</strong> (
          {vehiculo.marca} {vehiculo.modelo}) registrado a nombre de{' '}
          <strong>{vehiculo.propietario_nombre}</strong>? Esta acción no se puede deshacer.
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

ConfirmarEliminarModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  vehiculo: PropTypes.object,
  eliminando: PropTypes.bool,
  error: PropTypes.string,
  onCancelar: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
}

export default ConfirmarEliminarModal
