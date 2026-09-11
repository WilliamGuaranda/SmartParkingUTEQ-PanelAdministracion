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
import { cilCheckAlt, cilHistory, cilPencil, cilTrash } from '@coreui/icons'
import { useHistorial } from '../../hooks/useHistorial'

// Mapeo flexible para nombres en español (CREACIÓN, EDICIÓN, ELIMINACIÓN) o inglés (INSERT, UPDATE, DELETE)
const CONFIG_ACCIONES = {
  CREACION: { color: 'success', etiqueta: 'Creado', icono: cilCheckAlt },
  CREACIÓN: { color: 'success', etiqueta: 'Creado', icono: cilCheckAlt },
  INSERT: { color: 'success', etiqueta: 'Creado', icono: cilCheckAlt },

  EDICION: { color: 'warning', etiqueta: 'Editado', icono: cilPencil },
  EDICIÓN: { color: 'warning', etiqueta: 'Editado', icono: cilPencil },
  UPDATE: { color: 'warning', etiqueta: 'Editado', icono: cilPencil },

  ELIMINACION: { color: 'danger', etiqueta: 'Eliminado', icono: cilTrash },
  ELIMINACIÓN: { color: 'danger', etiqueta: 'Eliminado', icono: cilTrash },
  DELETE: { color: 'danger', etiqueta: 'Eliminado', icono: cilTrash },
}

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
    (campo) => String(anteriores[campo] ?? '') !== String(nuevos[campo] ?? ''),
  ).map((campo) => ({
    campo: ETIQUETAS_CAMPOS[campo] || campo,
    antes:
      anteriores[campo] === null || anteriores[campo] === undefined
        ? '—'
        : String(anteriores[campo]),
    despues:
      nuevos[campo] === null || nuevos[campo] === undefined
        ? '—'
        : String(nuevos[campo]),
  }))
}

const BadgeAccion = ({ accion }) => {
  const clave = String(accion || '').trim().toUpperCase()
  const estilo = CONFIG_ACCIONES[clave] || {
    color: 'secondary',
    etiqueta: accion || 'Desconocido',
    icono: null,
  }

  const textClass = estilo.color === 'warning' ? 'text-dark' : 'text-white'

  return (
    <CBadge
      color={estilo.color}
      shape="rounded-pill"
      className={`d-inline-flex align-items-center gap-1 px-3 py-2 fw-semibold ${textClass}`}
    >
      {estilo.icono && <CIcon icon={estilo.icono} size="sm" />}
      {estilo.etiqueta}
    </CBadge>
  )
}

const HistorialVehiculos = () => {
  const { historial, cargando, error, recargar } = useHistorial()

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>
            <CIcon icon={cilHistory} className="me-2" />
            Historial de cambios — Vehículos
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
              Si el error menciona que la tabla <code>vehiculos_historial</code> no existe, corre el script SQL en Supabase.
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
                  const accionUpper = String(registro.accion || '').toUpperCase()
                  const esCreacion = accionUpper.includes('CREA') || accionUpper === 'INSERT'
                  const esEliminacion = accionUpper.includes('ELIM') || accionUpper === 'DELETE'
                  const esEdicion = accionUpper.includes('EDIC') || accionUpper === 'UPDATE'

                  const datos = registro.datos_nuevos || registro.datos_anteriores || {}
                  const cambios = obtenerCambios(
                    registro.datos_anteriores,
                    registro.datos_nuevos,
                  )

                  return (
                    <CTableRow key={registro.id}>
                      <CTableDataCell className="small text-nowrap">
                        {formatearFecha(registro.modificado_en)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <BadgeAccion accion={registro.accion} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="dark">{datos.placa || '—'}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {datos.marca} {datos.modelo}
                      </CTableDataCell>
                      <CTableDataCell>{datos.propietario_nombre}</CTableDataCell>
                      <CTableDataCell>
                        {esCreacion && (
                          <span className="text-body-secondary small">Registro creado</span>
                        )}
                        {esEliminacion && (
                          <span className="text-body-secondary small">Registro eliminado</span>
                        )}
                        {esEdicion &&
                          (cambios.length === 0 ? (
                            <span className="text-body-secondary small">
                              Sin cambios detectados
                            </span>
                          ) : (
                            <ul className="small mb-0 ps-3">
                              {cambios.map((cambio) => (
                                <li key={cambio.campo}>
                                  <strong>{cambio.campo}:</strong> {cambio.antes} →{' '}
                                  {cambio.despues}
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