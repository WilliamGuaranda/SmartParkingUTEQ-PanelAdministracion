/**
 * ============================================================================
 *  useCamera — Cámara del dispositivo (getUserMedia)
 * ============================================================================
 *  - Pide permiso, muestra vista previa en vivo.
 *  - Prefiere la cámara TRASERA en móviles (facingMode: 'environment').
 *  - Captura un fotograma como Blob JPEG (calidad 0.92).
 *  - Libera SIEMPRE los tracks al detener o al desmontar el componente.
 *
 *  Requisitos:
 *   - HTTPS habilitado (o localhost). Es una regla de getUserMedia.
 *   - Permiso de cámara concedido al menos una vez.
 *
 *  @returns {{
 *    videoRef: React.RefObject<HTMLVideoElement>,
 *    activa: boolean,
 *    iniciando: boolean,
 *    error: string,
 *    iniciar: () => Promise<void>,
 *    detener: () => void,
 *    capturarFoto: () => Promise<Blob>,
 *  }}
 * ============================================================================
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export const useCamera = () => {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [activa, setActiva] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [error, setError] = useState('')

  /** Detiene el stream actual y limpia la referencia del <video>. */
  const detener = useCallback(() => {
    streamRef.current?.getTracks().forEach((pista) => pista.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActiva(false)
  }, [])

  /** Activa la cámara (preferencia: trasera en móviles). */
  const iniciar = useCallback(async () => {
    setError('')
    setIniciando(true)
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
      setActiva(true)
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
  }, [])

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

  // Cleanup al desmontar la vista: se apaga la cámara siempre.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((pista) => pista.stop())
      streamRef.current = null
    }
  }, [])

  return { videoRef, activa, iniciando, error, iniciar, detener, capturarFoto }
}

export default useCamera