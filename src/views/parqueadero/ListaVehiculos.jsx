import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'

import { useVehiculos } from '../../hooks/useVehiculos'
import VehiculoFormModal from './VehiculoFormModal'

const ListaVehiculos = () => {
  const {
    vehiculos,
    cargando,
    error,
    recargar,
    crearVehiculo,
    actualizarVehiculo,
    desactivarVehiculo,
    obtenerEstacionamientoActivo,
  } = useVehiculos()

  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const vehiculosPorPagina = 10

  const [modalFormVisible, setModalFormVisible] = useState(false)
  const [vehiculoEnEdicion, setVehiculoEnEdicion] = useState(null)
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [consultandoEliminacion, setConsultandoEliminacion] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')
  const [estacionamientoActivo, setEstacionamientoActivo] = useState(null)
  const [mensajeExito, setMensajeExito] = useState('')

  useEffect(() => {
    if (!mensajeExito) return undefined
    const temporizador = setTimeout(() => setMensajeExito(''), 4000)
    return () => clearTimeout(temporizador)
  }, [mensajeExito])

  const abrirCreacion = () => {
    setVehiculoEnEdicion(null)
    setModalFormVisible(true)
  }

  const abrirEdicion = (vehiculo) => {
    setVehiculoEnEdicion(vehiculo)
    setModalFormVisible(true)
  }

  const cerrarFormulario = () => {
    setModalFormVisible(false)
    setVehiculoEnEdicion(null)
  }

  const guardarVehiculo = async (datos) => {
    if (vehiculoEnEdicion) {
      await actualizarVehiculo(vehiculoEnEdicion.id, datos)
      setMensajeExito('Vehículo actualizado correctamente.')
    } else {
      const resultado = await crearVehiculo(datos)
      setMensajeExito(
        resultado?.reactivado
          ? 'Vehículo reactivado correctamente. Su historial se ha conservado.'
          : 'Vehículo creado correctamente.',
      )
    }
    setModalFormVisible(false)
    setVehiculoEnEdicion(null)
  }

  const abrirEliminacion = async (vehiculo) => {
    setVehiculoAEliminar(vehiculo)
    setEstacionamientoActivo(null)
    setErrorEliminar('')
    setConsultandoEliminacion(true)

    try {
      const estacionamiento = await obtenerEstacionamientoActivo(vehiculo.id)
      setEstacionamientoActivo(estacionamiento)
    } catch (errorConsulta) {
      setErrorEliminar(
        `No se pudo comprobar si el vehículo está estacionado: ${errorConsulta.message}`,
      )
    } finally {
      setConsultandoEliminacion(false)
    }
  }

  const cerrarEliminacion = () => {
    if (eliminando || consultandoEliminacion) return
    setVehiculoAEliminar(null)
    setEstacionamientoActivo(null)
    setErrorEliminar('')
  }

  const confirmarEliminacion = async () => {
    if (!vehiculoAEliminar || estacionamientoActivo) return

    setEliminando(true)
    setErrorEliminar('')

    try {
      await desactivarVehiculo(vehiculoAEliminar.id)
      setMensajeExito('Vehículo retirado correctamente. Su historial se ha conservado.')
      cerrarEliminacion()
    } catch (errorBorrado) {
      if (errorBorrado.codigo === 'VEHICULO_ESTACIONADO') {
        setEstacionamientoActivo(errorBorrado.estacionamiento)
      } else {
        setErrorEliminar(errorBorrado.message)
      }
    } finally {
      setEliminando(false)
    }
  }

  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return vehiculos

    return vehiculos.filter((vehiculo) =>
      [
        vehiculo.placa,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.color,
        vehiculo.propietario_nombre,
        vehiculo.cedula_propietario,
        vehiculo.correo_institucional,
      ].some((valor) => valor?.toLowerCase().includes(texto)),
    )
  }, [vehiculos, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(vehiculosFiltrados.length / vehiculosPorPagina))
  const paginaActual = Math.min(pagina, totalPaginas)

  const vehiculosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * vehiculosPorPagina
    return vehiculosFiltrados.slice(inicio, inicio + vehiculosPorPagina)
  }, [vehiculosFiltrados, paginaActual])

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Vehículos y propietarios</strong>
          <div className="small text-body-secondary">
            Vehículos autorizados en UTEQ Smart Parking
          </div>
        </div>

        <div className="d-flex gap-2">
          <CButton color="primary" onClick={abrirCreacion}>
            <CIcon icon={cilPlus} className="me-1" />
            Nuevo vehículo
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

        <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
          <CFormInput
            type="search"
            placeholder="Buscar placa, vehículo o propietario..."
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
          <>
            <CTable align="middle" bordered hover responsive striped>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Foto del vehículo</CTableHeaderCell>
                  <CTableHeaderCell>Placa</CTableHeaderCell>
                  <CTableHeaderCell>Vehículo</CTableHeaderCell>
                  <CTableHeaderCell>Año / color</CTableHeaderCell>
                  <CTableHeaderCell>Foto del propietario</CTableHeaderCell>
                  <CTableHeaderCell>Propietario</CTableHeaderCell>
                  <CTableHeaderCell>Cédula</CTableHeaderCell>
                  <CTableHeaderCell>Correo</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {vehiculosPaginados.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={10} className="text-center py-4">
                      No se encontraron vehículos.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  vehiculosPaginados.map((vehiculo) => (
                    <CTableRow key={vehiculo.id}>
                      <CTableDataCell>
                        <a
                          href={vehiculo.foto_fuente_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir fuente de la imagen"
                        >
                          <img
                            src={vehiculo.foto_url}
                            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                            width="100"
                            height="65"
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </a>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color="dark" className="fs-6">
                          {vehiculo.placa}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <strong>{vehiculo.marca}</strong>
                        <div className="small text-body-secondary">{vehiculo.modelo}</div>
                      </CTableDataCell>

                      <CTableDataCell>
                        {vehiculo.anio}
                        <div className="small text-body-secondary">{vehiculo.color}</div>
                      </CTableDataCell>

                      <CTableDataCell className="text-center">
                        <img
                          src={vehiculo.foto_propietario_url}
                          alt={`Fotografía de ${vehiculo.propietario_nombre}`}
                          width="60"
                          height="60"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid var(--cui-border-color)',
                          }}
                        />
                      </CTableDataCell>

                      <CTableDataCell>{vehiculo.propietario_nombre}</CTableDataCell>

                      <CTableDataCell>{vehiculo.cedula_propietario}</CTableDataCell>

                      <CTableDataCell>
                        <a href={`mailto:${vehiculo.correo_institucional}`}>
                          {vehiculo.correo_institucional}
                        </a>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color={vehiculo.autorizado ? 'success' : 'danger'}>
                          {vehiculo.autorizado ? 'Autorizado' : 'No autorizado'}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <div className="d-flex gap-2">
                          <CButton
                            color="info"
                            variant="outline"
                            size="sm"
                            onClick={() => abrirEdicion(vehiculo)}
                            title="Editar vehículo"
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => abrirEliminacion(vehiculo)}
                            title="Eliminar vehículo"
                          >
                            <CIcon icon={cilTrash} />
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

      <VehiculoFormModal
        visible={modalFormVisible}
        vehiculo={vehiculoEnEdicion}
        onGuardar={guardarVehiculo}
        onCerrar={cerrarFormulario}
      />

      <CModal visible={Boolean(vehiculoAEliminar)} onClose={cerrarEliminacion} alignment="center">
        <CModalHeader closeButton>
          <CModalTitle>
            {estacionamientoActivo ? 'Vehículo actualmente estacionado' : 'Retirar vehículo'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {consultandoEliminacion ? (
            <div className="text-center py-3">
              <CSpinner color="primary" />
              <p className="mt-3 mb-0">Comprobando si el vehículo está estacionado...</p>
            </div>
          ) : estacionamientoActivo ? (
            <CAlert color="warning">
              <strong>⚠️ No se puede retirar este vehículo.</strong>
              <div className="mt-2">
                El vehículo <strong>{vehiculoAEliminar?.placa}</strong> de{' '}
                <strong>{vehiculoAEliminar?.propietario_nombre}</strong> se encuentra actualmente
                estacionado en el puesto{' '}
                <strong>{estacionamientoActivo.puesto_codigo}</strong>.
              </div>
              <div className="mt-2">
                Debe registrar su salida antes de poder retirarlo de la lista de vehículos.
              </div>
            </CAlert>
          ) : (
            <>
              {errorEliminar && <CAlert color="danger">{errorEliminar}</CAlert>}
              <p className="mb-2">
                ¿Está seguro de retirar el vehículo <strong>{vehiculoAEliminar?.placa}</strong> de{' '}
                <strong>{vehiculoAEliminar?.propietario_nombre}</strong>?
              </p>
              <p className="mb-0 text-body-secondary">
                El vehículo dejará de aparecer en la lista de activos, pero su historial de
                estacionamientos se conservará y podrá reactivarse posteriormente.
              </p>
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={cerrarEliminacion}
            disabled={eliminando || consultandoEliminacion}
          >
            Cerrar
          </CButton>

          {!consultandoEliminacion && !estacionamientoActivo && (
            <CButton color="danger" onClick={confirmarEliminacion} disabled={eliminando}>
              {eliminando ? <CSpinner size="sm" /> : 'Retirar vehículo'}
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default ListaVehiculos