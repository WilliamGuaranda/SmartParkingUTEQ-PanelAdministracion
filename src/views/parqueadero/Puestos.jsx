import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCarAlt, cilPencil, cilPlus, cilTrash } from '@coreui/icons'

import { usePuestos } from '../../hooks/usePuestos'
import PuestoFormModal from './PuestoFormModal'
import PuestoEstadoModal from './PuestoEstadoModal'

const ESTADOS_FILTRO = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'DISPONIBLE', label: 'Libres' },
  { valor: 'OCUPADO', label: 'Ocupados' },
]

const Puestos = () => {
  const navigate = useNavigate()
  const {
    puestos,
    ocupacionActual,
    cargando,
    error,
    recargar,
    crearPuesto,
    actualizarPuesto,
    eliminarPuesto,
    marcarOcupado,
    marcarLibre,
    total,
    libres,
    ocupados,
    porcentajeDisponible,
  } = usePuestos()

  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroColumna, setFiltroColumna] = useState('todas')

  const [modalFormVisible, setModalFormVisible] = useState(false)
  const [puestoEnEdicion, setPuestoEnEdicion] = useState(null)

  const [puestoEnEstado, setPuestoEnEstado] = useState(null)

  const [puestoAEliminar, setPuestoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  const [mensajeExito, setMensajeExito] = useState('')

  const letrasColumna = useMemo(
    () => [...new Set(puestos.map((p) => p.columna))].sort(),
    [puestos],
  )

  const opcionesColumna = useMemo(
    () => [
      { valor: 'todas', label: 'Todas' },
      ...letrasColumna.map((l) => ({ valor: l, label: l })),
    ],
    [letrasColumna],
  )

  const puestosFiltrados = useMemo(
    () =>
      puestos.filter((p) => {
        const coincideEstado = filtroEstado === 'todos' || p.estado === filtroEstado
        const coincideColumna = filtroColumna === 'todas' || p.columna === filtroColumna
        return coincideEstado && coincideColumna
      }),
    [puestos, filtroEstado, filtroColumna],
  )

  const columnas = useMemo(() => {
    const letras = [...new Set(puestosFiltrados.map((p) => p.columna))].sort()
    return letras.map((letra) => ({
      letra,
      items: puestosFiltrados
        .filter((p) => p.columna === letra)
        .sort((a, b) => a.numero - b.numero),
    }))
  }, [puestosFiltrados])

  const abrirCreacion = () => {
    setPuestoEnEdicion(null)
    setModalFormVisible(true)
  }

  const abrirEdicion = (puesto, evento) => {
    evento.stopPropagation()
    setPuestoEnEdicion(puesto)
    setModalFormVisible(true)
  }

  const cerrarFormulario = () => {
    setModalFormVisible(false)
    setPuestoEnEdicion(null)
  }

  const guardarPuesto = async (datos) => {
    if (puestoEnEdicion) {
      await actualizarPuesto(puestoEnEdicion.id, datos)
      setMensajeExito('Puesto actualizado correctamente.')
    } else {
      await crearPuesto(datos)
      setMensajeExito('Puesto creado correctamente.')
    }
    cerrarFormulario()
  }

  const manejarOcupar = async (datos) => {
    await marcarOcupado(puestoEnEstado, datos)
    setMensajeExito(`Puesto ${puestoEnEstado.codigo} marcado como ocupado.`)
    setPuestoEnEstado(null)
  }

  const manejarLiberar = async (datos) => {
    await marcarLibre(puestoEnEstado, datos)
    setMensajeExito(`Puesto ${puestoEnEstado.codigo} marcado como libre.`)
    setPuestoEnEstado(null)
  }

  const confirmarEliminacion = async () => {
    if (!puestoAEliminar) return
    setEliminando(true)
    setErrorEliminar('')
    try {
      await eliminarPuesto(puestoAEliminar.id)
      setMensajeExito('Puesto eliminado correctamente.')
      setPuestoAEliminar(null)
    } catch (errorBorrado) {
      setErrorEliminar(errorBorrado.message)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>Puestos de parqueo</strong>
          <div className="small text-body-secondary">
            Ocupación en vivo del estacionamiento UTEQ Smart Parking
          </div>
        </div>

        <div className="d-flex gap-2">
          <CButton color="primary" onClick={abrirCreacion}>
            <CIcon icon={cilPlus} className="me-1" />
            Nuevo puesto
          </CButton>
          <CButton color="success" onClick={recargar} disabled={cargando}>
            Actualizar
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {mensajeExito && (
          <CAlert color="success" dismissible onClose={() => setMensajeExito('')}>
            {mensajeExito}
          </CAlert>
        )}

        {/* ============ TARJETAS DE RESUMEN ============ */}
        <CRow className="mb-4 g-3">
          <CCol xs={6} md={3}>
            <CCard className="text-center h-100">
              <CCardBody className="py-3">
                <div className="fs-4 fw-semibold">{total}</div>
                <div className="small text-body-secondary">Total de puestos</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs={6} md={3}>
            <CCard className="text-center h-100">
              <CCardBody className="py-3">
                <div className="fs-4 fw-semibold text-success">{libres}</div>
                <div className="small text-body-secondary">Libres</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs={6} md={3}>
            <CCard className="text-center h-100">
              <CCardBody className="py-3">
                <div className="fs-4 fw-semibold text-danger">{ocupados}</div>
                <div className="small text-body-secondary">Ocupados</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol xs={6} md={3}>
            <CCard className="text-center h-100">
              <CCardBody className="py-3">
                <div className="fs-4 fw-semibold">{porcentajeDisponible.toFixed(0)}%</div>
                <div className="small text-body-secondary">Disponibilidad</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* ============ FILTROS ============ */}
        <div className="mb-3">
          <div className="text-success text-uppercase small fw-semibold">Vista operativa</div>
          <h5 className="mb-3">Disponibilidad por espacio</h5>

          <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
            <div className="d-flex gap-2 flex-wrap">
              {ESTADOS_FILTRO.map((op) => (
                <CButton
                  key={op.valor}
                  size="sm"
                  shape="rounded-pill"
                  color={filtroEstado === op.valor ? 'success' : 'secondary'}
                  variant={filtroEstado === op.valor ? undefined : 'outline'}
                  onClick={() => setFiltroEstado(op.valor)}
                >
                  {op.label}
                </CButton>
              ))}
            </div>

            <div className="d-flex gap-2 flex-wrap">
              {opcionesColumna.map((op) => (
                <CButton
                  key={op.valor}
                  size="sm"
                  shape="rounded-pill"
                  color={filtroColumna === op.valor ? 'success' : 'secondary'}
                  variant={filtroColumna === op.valor ? undefined : 'outline'}
                  onClick={() => setFiltroColumna(op.valor)}
                >
                  {op.label}
                </CButton>
              ))}
            </div>
          </div>
        </div>

        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />
            <p className="mt-3">Cargando puestos...</p>
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">No se pudieron cargar los puestos: {error}</CAlert>
        )}

        {!cargando && !error && total === 0 && (
          <CAlert color="info">
            Todavía no hay puestos registrados. Crea el primero con &quot;Nuevo puesto&quot;.
          </CAlert>
        )}

        {!cargando && !error && total > 0 && (
          <>
            <div className="text-center small text-body-secondary text-uppercase py-2 mb-3 border rounded bg-body-tertiary">
              Entrada
            </div>

            {puestosFiltrados.length === 0 ? (
              <CAlert color="secondary">Ningún puesto coincide con el filtro seleccionado.</CAlert>
            ) : (
              <CRow className="g-3">
                {columnas.map((columna) => (
                  <CCol key={columna.letra} xs={12} sm={6} lg={3}>
                    <div className="small text-body-secondary text-uppercase mb-2">
                      Columna {columna.letra}
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {columna.items.map((puesto) => {
                        const disponible = puesto.estado === 'DISPONIBLE'
                        const ocupacion = ocupacionActual[puesto.id]
                        return (
                          <CCard
                            key={puesto.id}
                            role="button"
                            onClick={() => navigate(`/parqueadero/puestos/${puesto.id}`)}
                            className={`border-${disponible ? 'success' : 'danger'} bg-${disponible ? 'success' : 'danger'}-subtle bg-opacity-25`}
                          >
                            <CCardBody className="py-2 px-3">
                              {/* Fila 1: ícono + código + badge */}
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <CIcon
                                  icon={cilCarAlt}
                                  size="lg"
                                  className={`flex-shrink-0 ${disponible ? 'text-success' : 'text-danger'}`}
                                />
                                <span className="fw-semibold fs-6 text-truncate">
                                  {puesto.codigo}
                                </span>
                                <CBadge
                                  color={disponible ? 'success' : 'danger'}
                                  className="ms-auto flex-shrink-0"
                                >
                                  {disponible ? 'Libre' : 'Ocupado'}
                                </CBadge>
                              </div>

                              {/* Fila 2: distancia + placa */}
                              <div className="small text-body-secondary text-truncate mb-2">
                                {puesto.distancia_cm != null && (
                                  <span>{Math.round(puesto.distancia_cm)} cm</span>
                                )}
                                {puesto.distancia_cm != null && ocupacion && <span> · </span>}
                                {ocupacion && <span>{ocupacion.placa_detectada}</span>}
                                {puesto.distancia_cm == null && !ocupacion && <span>&nbsp;</span>}
                              </div>

                              {/* Fila 3: botones */}
                              <div className="d-flex gap-1 flex-wrap">
                                <CButton
                                  color="secondary"
                                  variant="outline"
                                  size="sm"
                                  title="Editar datos del puesto"
                                  onClick={(e) => abrirEdicion(puesto, e)}
                                >
                                  <CIcon icon={cilPencil} />
                                </CButton>
                                <CButton
                                  color="info"
                                  variant="outline"
                                  size="sm"
                                  title={disponible ? 'Marcar ocupado' : 'Marcar libre'}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPuestoEnEstado(puesto)
                                  }}
                                >
                                  {disponible ? 'Ocupar' : 'Liberar'}
                                </CButton>
                                <CButton
                                  color="danger"
                                  variant="outline"
                                  size="sm"
                                  title="Eliminar puesto"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPuestoAEliminar(puesto)
                                  }}
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </div>
                            </CCardBody>
                          </CCard>
                        )
                      })}
                    </div>
                  </CCol>
                ))}
              </CRow>
            )}
          </>
        )}
      </CCardBody>

      <PuestoFormModal
        visible={modalFormVisible}
        puesto={puestoEnEdicion}
        onGuardar={guardarPuesto}
        onCerrar={cerrarFormulario}
      />

      <PuestoEstadoModal
        visible={Boolean(puestoEnEstado)}
        puesto={puestoEnEstado}
        onOcupar={manejarOcupar}
        onLiberar={manejarLiberar}
        onCerrar={() => setPuestoEnEstado(null)}
      />

      <CModal
        visible={Boolean(puestoAEliminar)}
        onClose={() => {
          setPuestoAEliminar(null)
          setErrorEliminar('')
        }}
        alignment="center"
      >
        <CModalHeader closeButton>
          <CModalTitle>Eliminar puesto</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {errorEliminar && <CAlert color="danger">{errorEliminar}</CAlert>}
          ¿Está seguro de eliminar el puesto <strong>{puestoAEliminar?.codigo}</strong>? Esta
          acción no se puede deshacer.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setPuestoAEliminar(null)}
            disabled={eliminando}
          >
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmarEliminacion} disabled={eliminando}>
            {eliminando ? <CSpinner size="sm" /> : 'Eliminar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default Puestos