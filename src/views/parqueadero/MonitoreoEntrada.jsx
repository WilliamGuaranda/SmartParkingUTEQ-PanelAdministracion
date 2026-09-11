import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'

const MAX_SIZE = 4 * 1024 * 1024 // 4 MiB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const MENSAJES_HTTP = {
  400: 'Imagen vacía, inválida o con dimensiones no permitidas (400).',
  413: 'La imagen supera los 4 MiB permitidos (413).',
  415: 'Formato no admitido. Usa JPG o PNG (415).',
  502: 'Fallo del servicio OCR o de Supabase (502). Intenta nuevamente.',
  504: 'Tiempo de espera agotado (504). Intenta nuevamente.',
}

const MonitoreoEntrada = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const [streaming, setStreaming] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [blob, setBlob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)

  // ---------- Cámara ----------
  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStreaming(true)
    } catch (e) {
      setError('No se pudo acceder a la cámara: ' + e.message)
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setStreaming(false)
  }, [])

  // Limpieza al desmontar (cambio de vista)
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // ---------- Captura ----------
  const capturar = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (b) => {
        if (!b) return
        setBlob(b)
        setPreviewUrl(URL.createObjectURL(b))
        setResultado(null)
        setError('')
      },
      'image/jpeg',
      0.92,
    )
  }

  // ---------- Selección de archivo ----------
  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Formato no admitido. Solo JPG o PNG.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('La imagen supera los 4 MiB permitidos.')
      return
    }
    setBlob(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResultado(null)
  }

  // ---------- Envío al endpoint ----------
  const detectarPlaca = async () => {
    if (!blob) return
    setLoading(true)
    setError('')
    setResultado(null)
    try {
      const res = await fetch(import.meta.env.VITE_OCR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': blob.type || 'application/octet-stream',
        },
        body: blob,
      })

      if (!res.ok) {
        setError(MENSAJES_HTTP[res.status] || `Error HTTP ${res.status}`)
        return
      }

      const data = await res.json()
      console.log('Respuesta OCR:', data) // útil para ajustar nombres de campos
      setResultado(data)
    } catch (e) {
      setError('Error de red o CORS: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const reiniciar = () => {
    setBlob(null)
    setPreviewUrl(null)
    setResultado(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ---------- Imagen marcada ----------
  const imagenMarcada =
    resultado?.imagen_marcada?.base64 && resultado?.imagen_marcada?.mime_type
      ? `data:${resultado.imagen_marcada.mime_type};base64,${resultado.imagen_marcada.base64}`
      : null

  // ---------- Render de resultados ----------
  const renderResultado = () => {
    if (!resultado) return null
    const { estado, vehiculo, placa, confianza } = resultado

    if (estado === 'encontrado' && resultado.vehiculo_encontrado && vehiculo) {
      const prop = vehiculo.propietario || vehiculo.propietarios || {}
      return (
        <>
          <CAlert color="success">
            <strong>Vehículo autorizado.</strong> Placa {placa} reconocida con confianza{' '}
            {confianza}%.
          </CAlert>

          {imagenMarcada && (
            <img
              src={imagenMarcada}
              alt="Vehículo con placa detectada"
              className="img-fluid mb-3 rounded"
            />
          )}

          <h6 className="mt-3">Datos del vehículo</h6>
          <CTable bordered small responsive>
            <CTableBody>
              <CTableRow><CTableDataCell>Placa</CTableDataCell><CTableDataCell>{placa}</CTableDataCell></CTableRow>
              <CTableRow><CTableDataCell>Confianza</CTableDataCell><CTableDataCell>{confianza} %</CTableDataCell></CTableRow>
              <CTableRow><CTableDataCell>Marca</CTableDataCell><CTableDataCell>{vehiculo.marca}</CTableDataCell></CTableRow>
              <CTableRow><CTableDataCell>Modelo</CTableDataCell><CTableDataCell>{vehiculo.modelo}</CTableDataCell></CTableRow>
              <CTableRow><CTableDataCell>Año</CTableDataCell><CTableDataCell>{vehiculo.anio || vehiculo.año}</CTableDataCell></CTableRow>
              <CTableRow><CTableDataCell>Color</CTableDataCell><CTableDataCell>{vehiculo.color}</CTableDataCell></CTableRow>
              <CTableRow><CTableDataCell>Tipo</CTableDataCell><CTableDataCell>{vehiculo.tipo}</CTableDataCell></CTableRow>
            </CTableBody>
          </CTable>

          {vehiculo.fotografia_url && (
            <img src={vehiculo.fotografia_url} alt="Vehículo" className="img-fluid rounded mb-3" />
          )}

          <h6 className="mt-3">Propietario</h6>
          <CTable bordered small responsive>
            <CTableBody>
              <CTableRow><CTableDataCell>Nombre</CTableDataCell><CTableDataCell>{prop.nombre || prop.nombres}</CTableDataCell></CTableRow>
              <CTableRow><CTableDataCell>Cédula</CTableDataCell><CTableDataCell>{prop.cedula}</CTableDataCell></CTableRow>
              <CTableRow>
                <CTableDataCell>Autorización</CTableDataCell>
                <CTableDataCell><CBadge color="success">Autorizado</CBadge></CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          {prop.fotografia_url && (
            <img src={prop.fotografia_url} alt="Propietario" className="img-fluid rounded" />
          )}
        </>
      )
    }

    if (estado === 'no_registrado') {
      return (
        <>
          <CAlert color="danger">
            <h4 className="alert-heading">VEHÍCULO NO REGISTRADO</h4>
            <p className="mb-1">Placa detectada: <strong>{placa}</strong></p>
            <p className="mb-1">Confianza: <strong>{confianza}%</strong></p>
            <hr />
            <p className="mb-0">No se autoriza el ingreso. El vehículo no existe en Supabase.</p>
          </CAlert>
          {imagenMarcada && (
            <img src={imagenMarcada} alt="Placa detectada" className="img-fluid rounded mb-3" />
          )}
          <CButton color="primary" onClick={reiniciar}>Procesar otra imagen</CButton>
        </>
      )
    }

    if (estado === 'sin_placa') {
      return <CAlert color="warning">No se detectó ninguna placa en la imagen.</CAlert>
    }
    if (estado === 'baja_confianza') {
      return <CAlert color="warning">Confianza muy baja. Vuelve a capturar la imagen.</CAlert>
    }
    if (estado === 'multiples_placas') {
      return <CAlert color="warning">Se detectaron varias placas. Acerca la cámara a una sola.</CAlert>
    }

    return <CAlert color="secondary">Estado recibido: {estado}</CAlert>
  }

  return (
    <CRow>
      {/* IZQUIERDA: captura */}
      <CCol lg={6} className="mb-3">
        <CCard>
          <CCardHeader><strong>Captura del vehículo</strong></CCardHeader>
          <CCardBody>
            <div className="bg-dark rounded mb-2 d-flex justify-content-center align-items-center" style={{ minHeight: 260 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', maxHeight: 360, display: streaming ? 'block' : 'none' }}
              />
              {!streaming && !previewUrl && (
                <span className="text-white-50">Cámara apagada</span>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="d-flex flex-wrap gap-2 mb-3">
              {!streaming ? (
                <CButton color="primary" onClick={startCamera}>Activar cámara</CButton>
              ) : (
                <>
                  <CButton color="danger" onClick={stopCamera}>Detener cámara</CButton>
                  <CButton color="success" onClick={capturar}>Capturar foto</CButton>
                </>
              )}
            </div>

            <label className="form-label">O selecciona una imagen (JPG / PNG):</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="form-control mb-3"
              onChange={onFileChange}
            />

            {previewUrl && (
              <>
                <p className="mb-1"><strong>Vista previa:</strong></p>
                <img src={previewUrl} alt="Vista previa" className="img-fluid rounded mb-3" />
              </>
            )}

            <CButton
              color="dark"
              className="w-100"
              disabled={!blob || loading}
              onClick={detectarPlaca}
            >
              {loading ? (<><CSpinner size="sm" className="me-2" />Procesando…</>) : 'Detectar placa'}
            </CButton>

            {error && <CAlert color="danger" className="mt-3 mb-0">{error}</CAlert>}
          </CCardBody>
        </CCard>
      </CCol>

      {/* DERECHA: resultados */}
      <CCol lg={6} className="mb-3">
        <CCard>
          <CCardHeader><strong>Resultados</strong></CCardHeader>
          <CCardBody>
            {!resultado && !loading && (
              <p className="text-body-secondary mb-0">
                Aún no se ha procesado ninguna imagen.
              </p>
            )}
            {loading && (
              <div className="text-center py-4">
                <CSpinner color="primary" />
                <p className="mt-2 mb-0">Reconociendo placa…</p>
              </div>
            )}
            {renderResultado()}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MonitoreoEntrada