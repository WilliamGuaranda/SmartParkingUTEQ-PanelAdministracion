import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilCarAlt, cilGrid, cilHistory } from '@coreui/icons'
import { Link } from 'react-router-dom'

const modulos = [
  {
    titulo: 'Padrón de Vehículos',
    categoria: 'REGISTRO Y PROPIETARIOS',
    descripcion:
      'Control de placas autorizadas, datos institucionales de conductores y emisión de permisos de acceso.',
    icono: cilCarAlt,
    ruta: '/parqueadero/vehiculos',
    tag: 'Vehículos',
    colorHex: '#10b981',
  },
  {
    titulo: 'Bahías y Puestos',
    categoria: 'INFRAESTRUCTURA FÍSICA',
    descripcion:
      'Distribución espacial por columnas y bloques, disponibilidad de plazas y vinculación de sensores.',
    icono: cilGrid,
    ruta: '/parqueadero/puestos',
    tag: 'Estacionamiento',
    colorHex: '#0284c7',
  },
  {
    titulo: 'Log de Auditoría',
    categoria: 'SEGURIDAD Y CONTROL',
    descripcion:
      'Trazabilidad completa de movimientos: historial de creaciones, modificaciones y eliminaciones registradas.',
    icono: cilHistory,
    ruta: '/parqueadero/historial',
    tag: 'Trazabilidad',
    colorHex: '#8b5cf6',
  },
]

const TarjetaModulo = ({ mod }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <CCol lg={4} md={6}>
      <CCard
        className="h-100 position-relative overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: '16px',
          backgroundColor: 'var(--cui-card-bg, #ffffff)',
          borderColor: hovered ? mod.colorHex : 'var(--cui-border-color, rgba(0, 0, 0, 0.12))',
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: hovered
            ? `0 12px 24px -6px ${mod.colorHex}30`
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.25s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${mod.colorHex}, transparent)`,
            opacity: hovered ? 1 : 0.6,
          }}
        />

        <CCardBody className="p-4 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: `${mod.colorHex}18`,
                  color: mod.colorHex,
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <CIcon icon={mod.icono} size="xl" />
              </div>

              <span
                className="px-2.5 py-1 rounded-pill fw-semibold"
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  color: mod.colorHex,
                  backgroundColor: `${mod.colorHex}15`,
                  border: `1px solid ${mod.colorHex}35`,
                }}
              >
                {mod.tag}
              </span>
            </div>

            <div
              className="text-body-secondary fw-semibold text-uppercase mb-1"
              style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}
            >
              {mod.categoria}
            </div>

            <h4 className="fw-bold mb-2 text-body" style={{ letterSpacing: '-0.01em' }}>
              {mod.titulo}
            </h4>

            <p className="text-body-secondary small mb-0" style={{ lineHeight: '1.6' }}>
              {mod.descripcion}
            </p>
          </div>

          <div
            className="mt-4 pt-3 border-top"
            style={{ borderColor: 'var(--cui-border-color-translucent, rgba(0, 0, 0, 0.08))' }}
          >
            <Link to={mod.ruta} className="text-decoration-none d-block">
              <CButton
                className="w-100 fw-semibold d-flex justify-content-between align-items-center py-2 px-3 border-0"
                style={{
                  backgroundColor: `${mod.colorHex}18`,
                  color: mod.colorHex,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = mod.colorHex
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${mod.colorHex}18`
                  e.currentTarget.style.color = mod.colorHex
                }}
              >
                <span>Acceder al módulo</span>
                <CIcon icon={cilArrowRight} />
              </CButton>
            </Link>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  )
}

const Dashboard = () => {
  return (
    <CContainer fluid className="py-4 px-3" style={{ minHeight: '75vh' }}>
      <div className="mb-4 mb-md-5">
        <div
          className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill border"
          style={{
            borderColor: 'var(--cui-border-color, rgba(0, 0, 0, 0.12))',
            backgroundColor: 'var(--cui-tertiary-bg, rgba(0, 0, 0, 0.03))',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span
            className="small text-body-secondary fw-semibold text-uppercase tracking-wider"
            style={{ fontSize: '0.72rem' }}
          >
            Garita UTEQ
          </span>
        </div>

        <h1 className="fw-bold text-body display-6 mb-2" style={{ letterSpacing: '-0.02em' }}>
          Gestión de Parqueadero
        </h1>

        <p className="text-body-secondary mb-0" style={{ maxWidth: '640px', fontSize: '0.98rem' }}>
          Plataforma centralizada para la supervisión, administración de plazas y control del flujo
          vehicular en el campus universitario.
        </p>
      </div>

      <CRow className="g-4">
        {modulos.map((mod, idx) => (
          <TarjetaModulo key={idx} mod={mod} />
        ))}
      </CRow>
    </CContainer>
  )
}

export default Dashboard