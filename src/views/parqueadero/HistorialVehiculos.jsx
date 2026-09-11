import React from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHistory } from '@coreui/icons'

import { useHistorial } from '../../hooks/useHistorial'

const COLOR_ACCION = {
  INSERT: 'success',
  UPDATE: 'warning',
  DELETE: 'danger',
}

const ETIQUETA_ACCION = {
  INSERT: 'Creado',
  UPDATE: 'Editado',
  DELETE: 'Eliminado',
}

// Campos que se comparan para mostrar "qué cambió" en un UPDATE.
const CAMPOS_MONITOREADOS = [
  'placa',
  'marca',
  'modelo',
  'anio',
  'color',
  'tipo',
  'propietario_nombre',
  'correo_institucional',
  'autorizado',
]

const ETIQUETAS_CAMPOS = {
  placa: 'Placa',
  marca: 'Marca',
  modelo: 'Modelo',
  anio: 'Año',
  color: 'Color',
  tipo: 'Tipo',
  propietario_nombre: 'Propietario',
  correo_institucional: 'Correo',
  autorizado: 'Autorizado',
}

const formatearFecha = (fechaIso) =>
  new Date(fechaIso).toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const obtenerCambios = (anteriores, nuevos) => {
  if (!anteriores || !nuevos) return []

  return CAMPOS_MONITOREADOS.filter(
    (campo) => String(anteriores[campo]) !== String(nuevos[campo]),
  ).map((campo) => ({
    campo: ETIQUETAS_CAMPOS[campo] || campo,
    antes: anteriores[campo] === null || anteriores[campo] === undefined ? '—' : String(anteriores[campo]),
    despues: nuevos[campo] === null || nuevos[campo] === undefined ? '—' : String(nuevos[campo]),
  }))
}

const HistorialVehiculos = () => {
  const { historial, cargando, error, recargar } = useHistorial()

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>
            <CIcon icon={cilHistory} className="me-2" />
            Historial de cambios
          </strong>
          <div className="small text-body-secondary">
            Registro de creación, edición y eliminación de vehículos
          </div>
        </div>

        <CButton color="secondary" variant="outline" onClick={recargar} disabled={cargando}>
          Actualizar
        </CButton>
      </CCardHeader>

      <CCardBody>
        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />
            <p className="mt-3">Cargando historial...</p>
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">
            No se pudo cargar el historial: {error}
            <div className="small mt-2">
              Si el error menciona que la tabla <code>vehiculos_historial</code> no existe, falta
              correr el script <code>sql/supabase_historial_vehiculos.sql</code> en Supabase.
            </div>
          </CAlert>
        )}

        {!cargando && !error && (
          <CTable align="middle" bordered hover responsive striped>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Acción</CTableHeaderCell>
                <CTableHeaderCell>Placa</CTableHeaderCell>
                <CTableHeaderCell>Vehículo</CTableHeaderCell>
                <CTableHeaderCell>Propietario</CTableHeaderCell>
                <CTableHeaderCell>Detalle del cambio</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {historial.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center py-4">
                    Aún no hay movimientos registrados.
                  </CTableDataCell>
                </CTableRow>
              ) : (
                historial.map((registro) => {
                  const datos = registro.datos_nuevos || registro.datos_anteriores || {}
                  const cambios = obtenerCambios(registro.datos_anteriores, registro.datos_nuevos)

                  return (
                    <CTableRow key={registro.id}>
                      <CTableDataCell className="small">
                        {formatearFecha(registro.modificado_en)}
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color={COLOR_ACCION[registro.accion] || 'secondary'}>
                          {ETIQUETA_ACCION[registro.accion] || registro.accion}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color="dark">{datos.placa}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        {datos.marca} {datos.modelo}
                      </CTableDataCell>

                      <CTableDataCell>{datos.propietario_nombre}</CTableDataCell>

                      <CTableDataCell>
                        {registro.accion === 'INSERT' && (
                          <span className="text-body-secondary small">Registro creado</span>
                        )}
                        {registro.accion === 'DELETE' && (
                          <span className="text-body-secondary small">Registro eliminado</span>
                        )}
                        {registro.accion === 'UPDATE' &&
                          (cambios.length === 0 ? (
                            <span className="text-body-secondary small">Sin cambios detectados</span>
                          ) : (
                            <ul className="small mb-0 ps-3">
                              {cambios.map((cambio) => (
                                <li key={cambio.campo}>
                                  <strong>{cambio.campo}:</strong> {cambio.antes} → {cambio.despues}
                                </li>
                              ))}
                            </ul>
                          ))}
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default HistorialVehiculos
