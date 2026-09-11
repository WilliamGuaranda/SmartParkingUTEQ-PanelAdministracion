import React, { useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCarAlt } from '@coreui/icons'

import { useVehiculos } from '../../hooks/useVehiculos'

// Vista de solo lectura: únicamente foto del vehículo, placa y a nombre
// de quién está. Para ver/editar todos los demás datos, usar la pestaña
// "Vehículo y propietario".
const VehiculosSimple = () => {
  const { vehiculos, cargando, error, recargar } = useVehiculos()
  const [busqueda, setBusqueda] = useState('')

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return vehiculos

    return vehiculos.filter((vehiculo) =>
      [vehiculo.placa, vehiculo.propietario_nombre].some((valor) =>
        valor?.toLowerCase().includes(texto),
      ),
    )
  }, [vehiculos, busqueda])

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>
            <CIcon icon={cilCarAlt} className="me-2" />
            Vehículos
          </strong>
          <div className="small text-body-secondary">Foto, placa y propietario de cada vehículo</div>
        </div>

        <CButton color="secondary" variant="outline" onClick={recargar} disabled={cargando}>
          Actualizar
        </CButton>
      </CCardHeader>

      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
          <CFormInput
            type="search"
            placeholder="Buscar placa o propietario..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            style={{ maxWidth: '420px' }}
          />
          <span className="text-body-secondary">{vehiculosFiltrados.length} vehículos</span>
        </div>

        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />
            <p className="mt-3">Cargando vehículos...</p>
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">No se pudieron cargar los vehículos: {error}</CAlert>
        )}

        {!cargando && !error && (
          <CTable align="middle" bordered hover responsive striped>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Foto</CTableHeaderCell>
                <CTableHeaderCell>Placa</CTableHeaderCell>
                <CTableHeaderCell>Propietario</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {vehiculosFiltrados.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={3} className="text-center py-4">
                    No se encontraron vehículos.
                  </CTableDataCell>
                </CTableRow>
              ) : (
                vehiculosFiltrados.map((vehiculo) => (
                  <CTableRow key={vehiculo.id}>
                    <CTableDataCell>
                      {vehiculo.foto_url ? (
                        <img
                          src={vehiculo.foto_url}
                          alt={`Vehículo con placa ${vehiculo.placa}`}
                          width="100"
                          height="65"
                          loading="lazy"
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <span className="text-body-secondary small">Sin foto</span>
                      )}
                    </CTableDataCell>

                    <CTableDataCell>
                      <CBadge color="dark" className="fs-6">
                        {vehiculo.placa}
                      </CBadge>
                    </CTableDataCell>

                    <CTableDataCell>{vehiculo.propietario_nombre}</CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default VehiculosSimple
