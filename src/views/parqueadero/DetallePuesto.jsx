import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft } from '@coreui/icons'

import { usePuestos } from '../../hooks/usePuestos'
import { useHistorialPuesto } from '../../hooks/useHistorialPuesto'
import PuestoEstadoModal from './PuestoEstadoModal'
import HistorialPuesto from './HistorialPuesto'

const formatoFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleString('es-EC', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—'

const DetallePuesto = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { puestos, cargando, ocupacionActual, marcarOcupado, marcarLibre } = usePuestos()
  const { historial, cargando: cargandoHistorial } = useHistorialPuesto(id, 30)
  const [modalEstadoVisible, setModalEstadoVisible] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')

  if (cargando) {
    return (
      <div className="text-center py-5">
        <CSpinner color="success" />
      </div>
    )
  }

  const puesto = puestos.find((p) => String(p.id) === String(id))

  if (!puesto) {
    return (
      <CAlert color="warning">
        Puesto no encontrado. <Link to="/parqueadero/puestos">Volver a puestos</Link>
      </CAlert>
    )
  }

  const ocupacion = ocupacionActual[puesto.id]

  const manejarOcupar = async (datos) => {
    await marcarOcupado(puesto, datos)
    setMensajeExito('Puesto marcado como ocupado.')
    setModalEstadoVisible(false)
  }

  const manejarLiberar = async (datos) => {
    await marcarLibre(puesto, datos)
    setMensajeExito('Puesto marcado como disponible.')
    setModalEstadoVisible(false)
  }

  return (
    <>
      <CButton color="link" className="ps-0 mb-3" onClick={() => navigate('/parqueadero/puestos')}>
        <CIcon icon={cilArrowLeft} className="me-1" />
        Volver a puestos
      </CButton>

      {mensajeExito && (
        <CAlert color="success" dismissible onClose={() => setMensajeExito('')}>
          {mensajeExito}
        </CAlert>
      )}

      <CRow className="g-4">
        <CCol lg={5}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Puesto {puesto.codigo}</strong>
              <CButton
                color={puesto.estado === 'DISPONIBLE' ? 'success' : 'danger'}
                size="sm"
                onClick={() => setModalEstadoVisible(true)}
              >
                {puesto.estado === 'DISPONIBLE' ? 'Marcar ocupado' : 'Marcar DISPONIBLE'}
              </CButton>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CBadge
                  color={puesto.estado === 'DISPONIBLE' ? 'success' : 'danger'}
                  className="fs-6"
                >
                  {puesto.estado.toUpperCase()}
                </CBadge>
              </div>

              <dl className="row mb-0">
                <dt className="col-6">Distancia detectada</dt>
                <dd className="col-6">
                  {puesto.distancia_cm != null ? `${Math.round(puesto.distancia_cm)} cm` : '—'}
                </dd>

                <dt className="col-6">Columna / Número</dt>
                <dd className="col-6">
                  {puesto.columna} / {puesto.numero}
                </dd>

                <dt className="col-6">Vehículo actual</dt>
                <dd className="col-6">{ocupacion?.placa_detectada || '—'}</dd>

                <dt className="col-6">Última actualización</dt>
                <dd className="col-6">{formatoFecha(puesto.ultima_actualizacion)}</dd>

                <dt className="col-6">Sensor (RTDB)</dt>
                <dd className="col-6">{puesto.sensor_id_rtdb || '—'}</dd>
              </dl>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={7}>
          <CCard>
            <CCardHeader>
              <strong>Historial de sesiones</strong>
            </CCardHeader>
            <CCardBody>
              {cargandoHistorial ? (
                <div className="text-center py-4">
                  <CSpinner color="success" />
                </div>
              ) : (
                <HistorialPuesto historial={historial} />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <PuestoEstadoModal
        visible={modalEstadoVisible}
        puesto={puesto}
        onOcupar={manejarOcupar}
        onLiberar={manejarLiberar}
        onCerrar={() => setModalEstadoVisible(false)}
      />
    </>
  )
}

export default DetallePuesto