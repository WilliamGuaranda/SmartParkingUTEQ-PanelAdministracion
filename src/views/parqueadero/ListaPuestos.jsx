import React, { useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CButtonGroup,
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
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGrid, cilList, cilPencil, cilPlus, cilTrash } from '@coreui/icons'

import { usePuestos } from '../../hooks/usePuestos'
import PuestoFormModal from './PuestoFormModal'
import ConfirmarEliminarPuestoModal from './ConfirmarEliminarPuestoModal'
import PuestosGrid from './PuestosGrid'

const PUESTOS_POR_PAGINA = 10

const colorEstado = (estado) => {
  const valor = (estado || '').toUpperCase()
  if (valor === 'DISPONIBLE') return 'success'
  if (valor === 'OCUPADO') return 'danger'
  return 'warning'
}

const formatearFecha = (valor) => (valor ? new Date(valor).toLocaleString() : '—')

const ListaPuestos = () => {
  const {
    puestos,
    cargando,
    error,
    guardando,
    eliminandoId,
    recargar,
    crearPuesto,
    actualizarPuesto,
    eliminarPuesto,
  } = usePuestos()

  const [vista, setVista] = useState('cuadricula') // 'cuadricula' | 'tabla'

  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [busquedaAnterior, setBusquedaAnterior] = useState('')

  if (busqueda !== busquedaAnterior) {
    setBusquedaAnterior(busqueda)
    setPagina(1)
  }

  const [modalFormularioVisible, setModalFormularioVisible] = useState(false)
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null)

  const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
  const [puestoAEliminar, setPuestoAEliminar] = useState(null)
  const [errorEliminar, setErrorEliminar] = useState('')

  const [toast, setToast] = useState(0)

  const mostrarToast = (color, mensaje) => {
    setToast(
      <CToast autohide delay={4000} visible color={color} className="text-white align-items-center">
        <div className="d-flex">
          <CToastBody>{mensaje}</CToastBody>
          <CToastClose className="me-2 m-auto" white />
        </div>
      </CToast>,
    )
  }

  const puestosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return puestos

    return puestos.filter((puesto) =>
      [puesto.codigo, puesto.columna, puesto.estado, puesto.sensor_id_rtdb].some((valor) =>
        valor?.toString().toLowerCase().includes(texto),
      ),
    )
  }, [puestos, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(puestosFiltrados.length / PUESTOS_POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)

  const puestosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * PUESTOS_POR_PAGINA
    return puestosFiltrados.slice(inicio, inicio + PUESTOS_POR_PAGINA)
  }, [puestosFiltrados, paginaActual])

  const abrirModalAgregar = () => {
    setPuestoSeleccionado(null)
    setModalFormularioVisible(true)
  }

  const abrirModalEditar = (puesto) => {
    setPuestoSeleccionado(puesto)
    setModalFormularioVisible(true)
  }

  const cerrarModalFormulario = () => {
    setModalFormularioVisible(false)
    setPuestoSeleccionado(null)
  }

  const manejarGuardar = async (idODatos, datosSiEsEdicion) => {
    const esEdicion = Boolean(datosSiEsEdicion)
    const resultado = esEdicion
      ? await actualizarPuesto(idODatos, datosSiEsEdicion)
      : await crearPuesto(idODatos)

    if (resultado.exito) {
      mostrarToast(
        'success',
        esEdicion ? 'Puesto actualizado correctamente.' : 'Puesto registrado correctamente.',
      )
      cerrarModalFormulario()
    }

    return resultado
  }

  const abrirModalEliminar = (puesto) => {
    setPuestoAEliminar(puesto)
    setErrorEliminar('')
    setModalEliminarVisible(true)
  }

  const cerrarModalEliminar = () => {
    setModalEliminarVisible(false)
    setPuestoAEliminar(null)
    setErrorEliminar('')
  }

  const confirmarEliminacion = async () => {
    if (!puestoAEliminar) return
    const resultado = await eliminarPuesto(puestoAEliminar.id)

    if (resultado.exito) {
      mostrarToast('success', 'Puesto eliminado correctamente.')
      cerrarModalEliminar()
    } else {
      setErrorEliminar(resultado.mensaje || 'No se pudo eliminar el puesto.')
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <strong>Puestos</strong>
            <div className="small text-body-secondary">Administración de UTEQ Smart Parking</div>
          </div>

          <div className="d-flex gap-2">
            <CButtonGroup>
              <CButton
                color="secondary"
                variant={vista === 'cuadricula' ? undefined : 'outline'}
                onClick={() => setVista('cuadricula')}
                title="Vista de cuadrícula"
              >
                <CIcon icon={cilGrid} className="me-1" />
                Cuadrícula
              </CButton>
              <CButton
                color="secondary"
                variant={vista === 'tabla' ? undefined : 'outline'}
                onClick={() => setVista('tabla')}
                title="Vista de tabla"
              >
                <CIcon icon={cilList} className="me-1" />
                Tabla
              </CButton>
            </CButtonGroup>

            <CButton color="secondary" variant="outline" onClick={recargar} disabled={cargando}>
              Actualizar
            </CButton>
            <CButton color="success" onClick={abrirModalAgregar} disabled={cargando}>
              <CIcon icon={cilPlus} className="me-1" />
              Agregar puesto
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
            <CFormInput
              type="search"
              placeholder="Buscar código, columna, sensor o estado..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              style={{ maxWidth: '420px' }}
            />

            <span className="text-body-secondary">{puestosFiltrados.length} puestos</span>
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

          {!cargando && !error && vista === 'cuadricula' && (
            <PuestosGrid puestos={puestosFiltrados} onSeleccionar={abrirModalEditar} />
          )}

          {!cargando && !error && vista === 'tabla' && (
            <>
              <CTable align="middle" bordered hover responsive striped>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>Código</CTableHeaderCell>
                    <CTableHeaderCell>Columna</CTableHeaderCell>
                    <CTableHeaderCell>Número</CTableHeaderCell>
                    <CTableHeaderCell>Sensor</CTableHeaderCell>
                    <CTableHeaderCell>Distancia</CTableHeaderCell>
                    <CTableHeaderCell>Última lectura</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {puestosPaginados.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center py-4">
                        No se encontraron puestos.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    puestosPaginados.map((puesto) => (
                      <CTableRow key={puesto.id}>
                        <CTableDataCell>
                          <CBadge color="dark" className="fs-6">
                            {puesto.codigo}
                          </CBadge>
                        </CTableDataCell>

                        <CTableDataCell>{puesto.columna}</CTableDataCell>

                        <CTableDataCell>{puesto.numero}</CTableDataCell>

                        <CTableDataCell className="small">
                          {puesto.sensor_id_rtdb || '—'}
                        </CTableDataCell>

                        <CTableDataCell>
                          {puesto.distancia_cm != null ? `${puesto.distancia_cm} cm` : '—'}
                        </CTableDataCell>

                        <CTableDataCell className="small">
                          {formatearFecha(puesto.ultima_actualizacion)}
                        </CTableDataCell>

                        <CTableDataCell>
                          <CBadge color={colorEstado(puesto.estado)} className="text-capitalize">
                            {puesto.estado?.toLowerCase()}
                          </CBadge>
                        </CTableDataCell>

                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CButton
                              color="info"
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModalEditar(puesto)}
                              title="Editar"
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModalEliminar(puesto)}
                              disabled={eliminandoId === puesto.id}
                              title="Eliminar"
                            >
                              {eliminandoId === puesto.id ? (
                                <CSpinner size="sm" />
                              ) : (
                                <CIcon icon={cilTrash} />
                              )}
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-between align-items-center">
                <small className="text-body-secondary">
                  Página {paginaActual} de {totalPaginas}
                </small>

                <div className="d-flex gap-2">
                  <CButton
                    color="secondary"
                    variant="outline"
                    disabled={paginaActual === 1}
                    onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
                  >
                    Anterior
                  </CButton>

                  <CButton
                    color="success"
                    variant="outline"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPagina((valor) => Math.min(totalPaginas, valor + 1))}
                  >
                    Siguiente
                  </CButton>
                </div>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>

      <PuestoFormModal
        visible={modalFormularioVisible}
        puesto={puestoSeleccionado}
        guardando={guardando}
        onClose={cerrarModalFormulario}
        onGuardar={manejarGuardar}
      />

      <ConfirmarEliminarPuestoModal
        visible={modalEliminarVisible}
        puesto={puestoAEliminar}
        eliminando={eliminandoId !== null}
        error={errorEliminar}
        onCancelar={cerrarModalEliminar}
        onConfirmar={confirmarEliminacion}
      />

      <CToaster placement="top-end" push={toast} />
    </>
  )
}

export default ListaPuestos