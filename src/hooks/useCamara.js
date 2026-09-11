/**
 * ============================================================================
 *  useCamara — Hook de control de cámara del dispositivo
 * ============================================================================
 *  Encapsula el ciclo de vida completo de `navigator.mediaDevices.getUserMedia()`.
 *
 *  Responsabilidades
 *  -----------------
 *  1. Activar la cámara POSTERIOR en móviles mediante `facingMode: 'environment'`
 *     (ideal para fotografiar vehículos desde la caseta del parqueadero).
 *  2. Enumerar las cámaras disponibles y permitir cambiar entre ellas
 *     (webcam interna + DroidCam/Iriun/Camo del celular, por ejemplo).
 *  3. Capturar el fotograma actual del <video> y devolverlo como Blob JPEG
 *     —peso reducido, calidad 0.92— para no superar el límite de 4 MiB.
 *  4. Liberar SIEMPRE el stream al desmontar (cambio de vista → LED apagado).
 *
 *  Requisitos del navegador
 *  ------------------------
 *  - HTTPS habilitado (o localhost). Es una regla del propio getUserMedia.
 *  - Permiso de cámara concedido al menos una vez (para leer los labels).
 *
 *  Nota de seguridad
 *  -----------------
 *  El MediaStream vive en un `useRef`, nunca en estado de React, para que
 *  no se re-renderice al recibir fotogramas y para poder detenerlo desde
 *  cualquier callback sin depender del ciclo de render.
 * ============================================================================
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export const useCamara = () => {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [camaraActiva, setCamaraActiva] = useState(false)
  const [errorCamara, setErrorCamara] = useState('')
  const [dispositivos, setDispositivos] = useState([])
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState('')

  /** Detiene el stream actual y limpia la referencia del <video>. Idempotente. */
  const detenerCamara = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCamaraActiva(false)
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
      // Si falla, el selector no se muestra; la cámara por defecto sigue OK.
    }
  }, [])

  /**
   * Activa la cámara.
   * @param {string} [deviceId] - Cámara concreta; si no se pasa, se usa la
   *                              posterior (environment) en móviles.
   */
  const activarCamara = useCallback(
    async (deviceId) => {
      setErrorCamara('')

      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorCamara('Este dispositivo o navegador no admite acceso a la cámara.')
        return
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
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
        setCamaraActiva(true)

        const pistaActiva = stream.getVideoTracks()[0]
        if (pistaActiva) {
          setDispositivoSeleccionado(pistaActiva.getSettings().deviceId || deviceId || '')
        }

        listarDispositivos()
      } catch (excepcion) {
        setErrorCamara(
          excepcion?.name === 'NotAllowedError'
            ? 'Se denegó el permiso de acceso a la cámara. Habilítelo en la configuración del navegador.'
            : 'No se pudo acceder a la cámara del dispositivo.',
        )
        setCamaraActiva(false)
      }
    },
    [listarDispositivos],
  )

  /** Cambia a otra cámara. Si ya estaba activa, reinicia con el nuevo deviceId. */
  const seleccionarDispositivo = useCallback(
    (deviceId) => {
      setDispositivoSeleccionado(deviceId)
      if (camaraActiva) {
        activarCamara(deviceId)
      }
    },
    [camaraActiva, activarCamara],
  )

  /**
   * Captura el fotograma actual como Blob JPEG (calidad 0.92).
   * @returns {Promise<Blob>}
   */
  const capturarFoto = useCallback(() => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current
      if (!video || !camaraActiva) {
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
          if (!blob) {
            reject(new Error('No se pudo generar la imagen capturada.'))
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        0.92,
      )
    })
  }, [camaraActiva])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    listarDispositivos()
    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', listarDispositivos)
      return () => navigator.mediaDevices.removeEventListener('devicechange', listarDispositivos)
    }
  }, [listarDispositivos])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return {
    videoRef,
    camaraActiva,
    errorCamara,
    dispositivos,
    dispositivoSeleccionado,
    activarCamara,
    detenerCamara,
    capturarFoto,
    seleccionarDispositivo,
  }
}

export default useCamara