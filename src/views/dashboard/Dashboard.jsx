import React from 'react'
import { CButton, CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCarAlt, cilShieldAlt, cilSpeedometer, cilArrowRight } from '@coreui/icons'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <CContainer fluid className="py-3">
      <CCard
        className="mb-4 border-0 shadow-sm text-center"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
        }}
      >
        <CCardBody className="p-5 text-white">
          <div className="d-inline-flex align-items-center justify-content-center p-3 mb-3 bg-success bg-opacity-10 rounded-circle">
            <CIcon icon={cilCarAlt} size="4xl" style={{ color: '#00e676' }} />
          </div>

          <h1 className="fw-bold mb-1 tracking-wide">
            SMART<span style={{ color: '#00e676' }}>PARKING</span>
          </h1>

          <h4 className="fw-semibold mb-3" style={{ color: '#00e676', letterSpacing: '0.5px' }}>
            Innovando con la comunidad UTEQ
          </h4>

          <p
            className="mx-auto mb-4"
            style={{ maxWidth: '650px', color: '#94a3b8', fontSize: '1.05rem' }}
          >
            Sistema inteligente para el control, registro y gestión del acceso vehicular en el
            campus de la Universidad Técnica Estatal de Quevedo.
          </p>

          <Link to="/parqueadero/vehiculos" style={{ textDecoration: 'none' }}>
            <CButton
              size="lg"
              className="fw-bold px-4 py-2 border-0"
              style={{ backgroundColor: '#00e676', color: '#0f172a' }}
            >
              Ir a Vehículos y Propietarios <CIcon icon={cilArrowRight} className="ms-2" />
            </CButton>
          </Link>
        </CCardBody>
      </CCard>

      <CRow>
        <CCol md={4} className="mb-4">
          <CCard className="h-100 border-0 shadow-sm text-center">
            <CCardBody className="p-4 d-flex flex-column align-items-center">
              <div className="p-3 bg-success bg-opacity-10 rounded-circle mb-3">
                <CIcon icon={cilCarAlt} size="xl" style={{ color: '#00e676' }} />
              </div>
              <h5 className="fw-bold">Gestión Vehicular</h5>
              <p className="text-body-secondary small mb-0">
                Registro y consulta directa de los vehículos autorizados para ingresar al campus
                UTEQ.
              </p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={4} className="mb-4">
          <CCard className="h-100 border-0 shadow-sm text-center">
            <CCardBody className="p-4 d-flex flex-column align-items-center">
              <div className="p-3 bg-info bg-opacity-10 rounded-circle mb-3">
                <CIcon icon={cilShieldAlt} size="xl" className="text-info" />
              </div>
              <h5 className="fw-bold">Acceso Seguro</h5>
              <p className="text-body-secondary small mb-0">
                Verificación rápida de datos de los propietarios, docentes, estudiantes y personal
                administrativo.
              </p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={4} className="mb-4">
          <CCard className="h-100 border-0 shadow-sm text-center">
            <CCardBody className="p-4 d-flex flex-column align-items-center">
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle mb-3">
                <CIcon icon={cilSpeedometer} size="xl" className="text-warning" />
              </div>
              <h5 className="fw-bold">Control de Garita</h5>
              <p className="text-body-secondary small mb-0">
                Optimización del flujo vehicular y tiempos de entrada en las vías del parqueadero
                universitario.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Dashboard