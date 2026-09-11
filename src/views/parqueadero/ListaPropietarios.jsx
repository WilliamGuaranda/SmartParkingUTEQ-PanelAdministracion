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
import { cilUser } from '@coreui/icons'

import { useVehiculos } from '../../hooks/useVehiculos'

// Un mismo propietario puede tener más de un vehículo. Como la tabla
// `vehiculos` guarda los datos del dueño en cada fila, aquí se agrupan
// usando el correo institucional como identificador de la persona.
const agruparPropietarios = (vehiculos) => {
  const mapa = new Map()

  vehiculos.forEach((vehiculo) => {
    const clave =
      vehiculo.correo_institucional?.toLowerCase().trim() ||
      `${vehiculo.propietario_nombre}-${vehiculo.cedula_enmascarada}`

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        clave,
        nombre: vehiculo.propietario_nombre,
        cedula_enmascarada: vehiculo.cedula_enmascarada,
        correo_institucional: vehiculo.correo_institucional,
        foto_propietario_url: vehiculo.foto_propietario_url,
        vehiculos: [],
      })
    }

    mapa.get(clave).vehiculos.push(vehiculo)
  })

  return Array.from(mapa.values())
}

const ListaPropietarios = () => {
  const { vehiculos, cargando, error, recargar } = useVehiculos()
  const [busqueda, setBusqueda] = useState('')

  const propietarios = useMemo(() => agruparPropietarios(vehiculos), [vehiculos])

  const propietariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return propietarios

    return propietarios.filter((propietario) =>
      [propietario.nombre, propietario.correo_institucional].some((valor) =>
        valor?.toLowerCase().includes(texto),
      ),
    )
  }, [propietarios, busqueda])

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>
            <CIcon icon={cilUser} className="me-2" />
            Propietarios
          </strong>
          <div className="small text-body-secondary">Personas registradas como dueñas de un vehículo</div>
        </div>

        <CButton color="secondary" variant="outline" onClick={recargar} disabled={cargando}>
          Actualizar
        </CButton>
      </CCardHeader>

      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
          <CFormInput
            type="search"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            style={{ maxWidth: '420px' }}
          />
          <span className="text-body-secondary">{propietariosFiltrados.length} propietarios</span>
        </div>

        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />
            <p className="mt-3">Cargando propietarios...</p>
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">No se pudieron cargar los propietarios: {error}</CAlert>
        )}

        {!cargando && !error && (
          <CTable align="middle" bordered hover responsive striped>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Foto</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Cédula</CTableHeaderCell>
                <CTableHeaderCell>Correo institucional</CTableHeaderCell>
                <CTableHeaderCell>Vehículos a su nombre</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {propietariosFiltrados.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center py-4">
                    No se encontraron propietarios.
                  </CTableDataCell>
                </CTableRow>
              ) : (
                propietariosFiltrados.map((propietario) => (
                  <CTableRow key={propietario.clave}>
                    <CTableDataCell className="text-center">
                      {propietario.foto_propietario_url ? (
                        <img
                          src={propietario.foto_propietario_url}
                          alt={`Fotografía de ${propietario.nombre}`}
                          width="50"
                          height="50"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid var(--cui-border-color)',
                          }}
                        />
                      ) : (
                        <span className="text-body-secondary small">Sin foto</span>
                      )}
                    </CTableDataCell>

                    <CTableDataCell>{propietario.nombre}</CTableDataCell>

                    <CTableDataCell>{propietario.cedula_enmascarada}</CTableDataCell>

                    <CTableDataCell>
                      {propietario.correo_institucional ? (
                        <a href={`mailto:${propietario.correo_institucional}`}>
                          {propietario.correo_institucional}
                        </a>
                      ) : (
                        <span className="text-body-secondary small">Sin correo</span>
                      )}
                    </CTableDataCell>

                    <CTableDataCell>
                      {propietario.vehiculos.map((vehiculo) => (
                        <CBadge key={vehiculo.id} color="dark" className="me-1 mb-1">
                          {vehiculo.placa}
                        </CBadge>
                      ))}
                    </CTableDataCell>
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

export default ListaPropietarios
