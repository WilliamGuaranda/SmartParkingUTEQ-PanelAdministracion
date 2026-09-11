/**
 * ============================================================================
 *  useCamera — Cámara del dispositivo (getUserMedia)
 * ============================================================================
 *  - Pide permiso, muestra vista previa en vivo.
 *  - Prefiere la cámara TRASERA en móviles (facingMode: 'environment').
 *  - Enumera las cámaras disponibles y permite cambiar entre ellas
 *    (webcam interna + DroidCam/Iriun/Camo del celular, etc.).
 *  - Captura un fotograma como Blob JPEG (calidad 0.92).
 *  - Libera SIEMPRE los tracks al detener o al desmontar el componente.
 * ============================================================================
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export const useCamera = () => {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [activa, setActiva] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [error, setError] = useState('')
  const [dispositivos, setDispositivos] = useState([]) // [{ deviceId, label }]
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState('')

  /** Detiene el stream actual y limpia la referencia del <video>. */
  const detener = useCallback(() => {
    streamRef.current?.getTracks().forEach((pista) => pista.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActiva(false)
  }, [])

  /**
   * Enumera las cámaras conectadas (kind === 'videoinput').
   * Los `label` solo vienen legibles DESPUÉS de conceder permiso, por eso
   * este método se vuelve a llamar tras activar la cámara.
   */
  const listarDispositivos = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    try {
      const lista = await navigator.mediaDevices.enumerateDevices()
      const camaras = lista
        .filter((d) => d.kind === 'videoinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Cámara ${i + 1}`,
        }))
      setDispositivos(camaras)
    } catch {
      // Si falla, simplemente no se muestra el selector.
    }
  }, [])

  /**
   * Activa la cámara.
   * @param {string} [deviceId] - Cámara concreta; si no se pasa, se usa la
   *                              posterior (environment) en móviles.
   */
  const iniciar = useCallback(
    async (deviceId) => {
      setError('')
      setIniciando(true)

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Este dispositivo o navegador no admite acceso a la cámara.')
        setIniciando(false)
        return
      }

      // Liberamos un stream previo antes de pedir uno nuevo.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((pista) => pista.stop())
        streamRef.current = null
      }

      const restriccionesVideo = deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: { ideal: 'environment' } }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: restriccionesVideo,
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setActiva(true)

        // Recordamos qué cámara quedó activa para marcar el selector.
        const pistaActiva = stream.getVideoTracks()[0]
        if (pistaActiva) {
          setDispositivoSeleccionado(pistaActiva.getSettings().deviceId || deviceId || '')
        }

        // Ahora que hay permiso, los labels vienen completos.
        listarDispositivos()
      } catch (errorCaptura) {
        if (
          errorCaptura.name === 'NotAllowedError' ||
          errorCaptura.name === 'PermissionDeniedError'
        ) {
          setError(
            'Se denegó el permiso de cámara. Autorice el acceso desde el navegador para continuar.',
          )
        } else if (errorCaptura.name === 'NotFoundError') {
          setError('No se encontró ninguna cámara disponible en este dispositivo.')
        } else {
          setError('No se pudo iniciar la cámara. Intente nuevamente.')
        }
        setActiva(false)
      } finally {
        setIniciando(false)
      }
    },
    [listarDispositivos],
  )

  /**
   * Cambia a otra cámara. Si la cámara ya está activa, la reinicia.
   */
  const seleccionarDispositivo = useCallback(
    (deviceId) => {
      setDispositivoSeleccionado(deviceId)
      if (activa) {
        iniciar(deviceId)
      }
    },
    [activa, iniciar],
  )

  /**
   * Captura el fotograma actual como Blob JPEG (calidad 0.92).
   * @returns {Promise<Blob>}
   */
  const capturarFoto = useCallback(() => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current
      if (!video || !streamRef.current) {
        reject(new Error('La cámara no está activa.'))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const contexto = canvas.getContext('2d')
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('No se pudo capturar la imagen.'))
          }
        },
        'image/jpeg',
        0.92,
      )
    })
  }, [])

  // Al montar, listamos cámaras y escuchamos cambios de hardware
  // (conectar/desconectar DroidCam, webcams USB, etc.).
  useEffect(() => {
    listarDispositivos()
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', listarDispositivos)
      return () => navigator.mediaDevices.removeEventListener('devicechange', listarDispositivos)
    }
  }, [listarDispositivos])

  // Cleanup al desmontar la vista: se apaga la cámara siempre.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((pista) => pista.stop())
      streamRef.current = null
    }
  }, [])

  return {
    videoRef,
    activa,
    iniciando,
    error,
    dispositivos,
    dispositivoSeleccionado,
    iniciar,
    detener,
    capturarFoto,
    seleccionarDispositivo,
  }
}

export default useCamera