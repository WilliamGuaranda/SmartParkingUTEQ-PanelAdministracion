import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCamera,
  cilCheckCircle,
  cilClock,
  cilCloudUpload,
  cilImage,
  cilList,
  cilReload,
  cilXCircle,
} from '@coreui/icons'

import { useCamera } from '../../hooks/useCamera'
import { reconocerPlaca } from '../../services/ocrService'
import { obtenerMensajeError } from '../../utils/errorHandler'
import { validarImagen } from '../../utils/imageValidator'
import { construirUrlImagenMarcada } from '../../utils/ocrResultado'
import ResultadoReconocimiento from './ResultadoReconocimiento'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const pad = (valor) => String(valor).padStart(2, '0')

const formatearFechaHora = (fecha) =>
  `${DIAS[fecha.getDay()]}, ${pad(fecha.getDate())} de ${MESES[fecha.getMonth()]}. de ${fecha.getFullYear()}  ${pad(
    fecha.getHours(),
  )}:${pad(fecha.getMinutes())}`

/**
 * Vista "Monitoreo de entrada": captura una foto (cámara o archivo),
 * la envía al endpoint OCR configurado en VITE_OCR_ENDPOINT y muestra
 * el resultado del reconocimiento de placa en tiempo real.
 *
 * Estados del flujo: vacio → camara → lista → procesando → resultado
 *                                                     ↘ error
 */
const MonitoreoEntrada = () => {
  const [ahora, setAhora] = useState(new Date())
  const [estadoFlujo, setEstadoFlujo] = useState('vacio')
  const [archivoActual, setArchivoActual] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [resultado, setResultado] = useState(null)
  const [mensajeError, setMensajeError] = useState('')
  const [errorValidacion, setErrorValidacion] = useState('')

  const {
    videoRef,
    activa: camaraActiva,
    iniciando: camaraIniciando,
    error: errorCamara,
    iniciar: iniciarCamara,
    detener: detenerCamara,
    capturarFoto: capturarFotoDesdeCamara,
  } = useCamera()
  const inputArchivoRef = useRef(null)

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 1000 * 30)
    return () => clearInterval(intervalo)
  }, [])

  // Libera la URL de objeto anterior cada vez que cambia o se abandona la vista.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const reiniciarEstado = (siguienteEstado = 'vacio') => {
    setResultado(null)
    setMensajeError('')
    setErrorValidacion('')
    setArchivoActual(null)
    setPreviewUrl('')
    setEstadoFlujo(siguienteEstado)
  }

  const iniciarNuevaCaptura = async () => {
    reiniciarEstado('camara')
    await iniciarCamara()
  }

  const cancelarCamara = () => {
    detenerCamara()
    reiniciarEstado('vacio')
  }

  const capturarFoto = async () => {
    try {
      const blob = await capturarFotoDesdeCamara()
      const { valido, mensaje } = validarImagen(blob)
      if (!valido) {
        throw new Error(mensaje)
      }
      detenerCamara()
      setArchivoActual(blob)
      setPreviewUrl(URL.createObjectURL(blob))
      setResultado(null)
      setMensajeError('')
      setEstadoFlujo('lista')
    } catch (errorCaptura) {
      setMensajeError(errorCaptura.message || 'No se pudo capturar la imagen.')
      setEstadoFlujo('error')
    }
  }

  const abrirSelectorArchivo = () => inputArchivoRef.current?.click()

  const manejarArchivoSeleccionado = (evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    const { valido, mensaje } = validarImagen(archivo)
    if (!valido) {
      setErrorValidacion(mensaje)
      return
    }

    setErrorValidacion('')
    setResultado(null)
    setMensajeError('')
    setArchivoActual(archivo)
    setPreviewUrl(URL.createObjectURL(archivo))
    setEstadoFlujo('lista')
  }

  const descartarPrevia = () => reiniciarEstado('vacio')

  const detectarPlaca = async () => {
    if (!archivoActual) return
    setEstadoFlujo('procesando')
    setMensajeError('')
    try {
      const data = await reconocerPlaca(archivoActual)
      // El endpoint ya ejecuta el OCR y consulta su propia BD.
      // La respuesta se pasa directamente a la UI.
      setResultado(data)
      setEstadoFlujo('resultado')
    } catch (errorSolicitud) {
      setResultado(null)
      setMensajeError(obtenerMensajeError(errorSolicitud))
      setEstadoFlujo('error')
    }
  }

  const subirOtraImagen = () => {
    reiniciarEstado('vacio')
    abrirSelectorArchivo()
  }

  const imagenMarcadaUrl = construirUrlImagenMarcada(resultado)
  const imagenAMostrar = imagenMarcadaUrl || previewUrl
  const procesando = estadoFlujo === 'procesando'

  return (
    <>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div className="d-flex align-items-stretch gap-2">
          <div className="bg-success rounded" style={{ width: 4 }} />
          <div>
            <h4 className="mb-0 fw-semibold">Monitoreo de entrada</h4>
            <div className="text-body-secondary">
              Reconocimiento automático de placas en tiempo real.
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 text-body-secondary small">
          <CIcon icon={cilClock} />
          {formatearFechaHora(ahora)}
        </div>
      </div>

      <CRow className="g-4">
        {/* Columna izquierda: imagen procesada */}
        <CCol lg={7}>
          <CCard className="h-100">
            <CCardHeader className="d-flex align-items-center gap-2 bg-transparent">
              <CIcon icon={cilImage} className="text-success" />
              <strong>Imagen procesada</strong>
            </CCardHeader>
            <CCardBody>
              <input
                ref={inputArchivoRef}
                type="file"
                accept="image/jpeg,image/png"
                className="d-none"
                onChange={manejarArchivoSeleccionado}
              />

              {estadoFlujo === 'camara' ? (
                <div
                  className="position-relative rounded overflow-hidden bg-dark"
                  style={{ aspectRatio: '4 / 3' }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  {camaraIniciando && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <CSpinner color="light" />
                    </div>
                  )}
                </div>
              ) : imagenMarcadaUrl ? (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="small text-body-secondary mb-1">Imagen original</div>
                    <div
                      className="rounded overflow-hidden border d-flex align-items-center justify-content-center"
                      style={{ maxHeight: 140, backgroundColor: '#f3f4f6' }}
                    >
                      <img
                        src={previewUrl}
                        alt="Imagen original capturada o subida"
                        style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 small text-success fw-semibold mb-1">
                      <CIcon icon={cilCheckCircle} />
                      Imagen procesada — placa detectada
                    </div>
                    <div
                      className="position-relative rounded overflow-hidden border border-success d-flex align-items-center justify-content-center"
                      style={{ minHeight: 300, maxHeight: 500, backgroundColor: '#f3f4f6' }}
                    >
                      <img
                        src={imagenMarcadaUrl}
                        alt="Vehículo con placa detectada marcada con recuadro verde"
                        className="w-100"
                        style={{ maxHeight: 500, objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                </div>
              ) : imagenAMostrar ? (
                <div
                  className="position-relative rounded overflow-hidden border d-flex align-items-center justify-content-center"
                  style={{ minHeight: 300, maxHeight: 500, backgroundColor: '#f3f4f6' }}
                >
                  <img
                    src={imagenAMostrar}
                    alt="Vehículo capturado"
                    className="w-100"
                    style={{ maxHeight: 500, objectFit: 'contain' }}
                  />
                  {procesando && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                      <CSpinner color="light" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="d-flex flex-column align-items-center justify-content-center text-center text-body-secondary bg-body-tertiary border rounded"
                  style={{ aspectRatio: '4 / 3' }}
                >
                  <CIcon icon={cilImage} size="xxl" className="mb-2 opacity-50" />
                  <div className="small px-3">
                    La imagen capturada o subida, con la placa resaltada, aparecerá aquí.
                  </div>
                </div>
              )}

              {errorCamara && estadoFlujo === 'camara' && (
                <CAlert color="danger" className="mt-3 mb-0">
                  {errorCamara}
                </CAlert>
              )}
              {errorValidacion && (
                <CAlert color="danger" className="mt-3 mb-0">
                  {errorValidacion}
                </CAlert>
              )}
            </CCardBody>
            <CCardFooter className="bg-transparent">
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                {estadoFlujo === 'vacio' && (
                  <>
                    <CButton color="success" onClick={iniciarNuevaCaptura}>
                      <CIcon icon={cilCamera} className="me-2" />
                      Nueva captura
                    </CButton>
                    <CButton color="secondary" variant="outline" onClick={abrirSelectorArchivo}>
                      <CIcon icon={cilCloudUpload} className="me-2" />
                      Subir otra imagen
                    </CButton>
                  </>
                )}

                {estadoFlujo === 'camara' && (
                  <>
                    <CButton color="success" onClick={capturarFoto} disabled={!camaraActiva}>
                      <CIcon icon={cilCamera} className="me-2" />
                      Capturar foto
                    </CButton>
                    <CButton color="secondary" variant="outline" onClick={cancelarCamara}>
                      <CIcon icon={cilXCircle} className="me-2" />
                      Cancelar
                    </CButton>
                  </>
                )}

                {(estadoFlujo === 'lista' || estadoFlujo === 'procesando') && (
                  <>
                    <CButton color="success" onClick={detectarPlaca} disabled={procesando}>
                      {procesando ? (
                        <CSpinner size="sm" className="me-2" />
                      ) : (
                        <CIcon icon={cilList} className="me-2" />
                      )}
                      Detectar placa
                    </CButton>
                    <CButton
                      color="secondary"
                      variant="outline"
                      onClick={descartarPrevia}
                      disabled={procesando}
                    >
                      <CIcon icon={cilXCircle} className="me-2" />
                      Descartar
                    </CButton>
                  </>
                )}

                {estadoFlujo === 'resultado' && (
                  <>
                    <CButton color="success" onClick={iniciarNuevaCaptura}>
                      <CIcon icon={cilCamera} className="me-2" />
                      Nueva captura
                    </CButton>
                    <CButton color="secondary" variant="outline" onClick={subirOtraImagen}>
                      <CIcon icon={cilCloudUpload} className="me-2" />
                      Subir otra imagen
                    </CButton>
                  </>
                )}

                {estadoFlujo === 'error' && (
                  <>
                    {archivoActual && (
                      <CButton color="success" onClick={detectarPlaca}>
                        <CIcon icon={cilReload} className="me-2" />
                        Reintentar
                      </CButton>
                    )}
                    <CButton color="secondary" variant="outline" onClick={descartarPrevia}>
                      <CIcon icon={cilXCircle} className="me-2" />
                      Descartar
                    </CButton>
                  </>
                )}
              </div>
            </CCardFooter>
          </CCard>
        </CCol>

        {/* Columna derecha: resultado del reconocimiento */}
        <CCol lg={5}>
          <CCard className="h-100">
            <CCardHeader className="d-flex align-items-center gap-2 bg-transparent">
              <CIcon icon={cilList} className="text-success" />
              <strong>Resultado del reconocimiento</strong>
            </CCardHeader>
            <CCardBody>
              <ResultadoReconocimiento
                estadoFlujo={estadoFlujo}
                resultado={resultado}
                mensajeError={mensajeError}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default MonitoreoEntrada