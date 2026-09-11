/**
 * ============================================================================
 *  useOcrPlaca — Consumo del endpoint REST de reconocimiento de placas
 * ============================================================================
 *  Contrato con el endpoint
 *  ------------------------
 *   - Método:   POST
 *   - Body:     BINARIO (Blob/File). NUNCA un JSON con Base64.
 *   - Header:   Content-Type = image/jpeg | image/png | application/octet-stream
 *   - URL:      import.meta.env.VITE_OCR_ENDPOINT (nunca hardcodeada)
 *
 *  Estados de respuesta soportados
 *  -------------------------------
 *   encontrado       → vehiculo_encontrado: true  + datos del vehículo
 *   no_registrado    → vehiculo_encontrado: false + vehiculo: null
 *   sin_placa        → no se detectó placa
 *   baja_confianza   → OCR poco fiable, hay que recapturar
 *   multiples_placas → hay más de una placa en la foto
 *
 *  Códigos HTTP mapeados a mensajes claros
 *  ---------------------------------------
 *   400 → imagen inválida / dimensiones no permitidas
 *   413 → imagen > 4 MiB
 *   415 → formato no admitido
 *   502 → fallo del OCR o de Supabase
 *   504 → timeout
 * ============================================================================
 */
import { useCallback, useState } from 'react'

export const TAMANIO_MAXIMO_BYTES = 4 * 1024 * 1024 // 4 MiB
export const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png']

const MENSAJES_HTTP = {
  400: 'La imagen enviada está vacía, es inválida o tiene dimensiones no permitidas.',
  413: 'La imagen supera el tamaño máximo permitido (4 MiB).',
  415: 'El formato de la imagen no es compatible. Use JPG o PNG.',
  502: 'El servicio de reconocimiento (OCR) o la base de datos no están disponibles en este momento.',
  504: 'El servicio de reconocimiento tardó demasiado en responder. Intente nuevamente.',
}

/**
 * Validación local (evita gastar ancho de banda si ya sabemos que fallará).
 * @returns {string|null} mensaje de error o null si la imagen es válida.
 */
export const validarImagen = (archivo) => {
  if (!archivo) return 'Debe capturar o seleccionar una imagen.'

  const tipo = archivo.type || ''
  if (!TIPOS_PERMITIDOS.includes(tipo)) {
    return 'Formato no admitido. Solo se permiten imágenes JPG o PNG.'
  }
  if (archivo.size > TAMANIO_MAXIMO_BYTES) {
    return 'La imagen supera el tamaño máximo permitido (4 MiB).'
  }
  if (archivo.size === 0) {
    return 'La imagen está vacía.'
  }
  return null
}

export const useOcrPlaca = () => {
  const [procesando, setProcesando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)

  const limpiarResultado = useCallback(() => {
    setResultado(null)
    setError(null)
  }, [])

  /**
   * Envía la imagen al endpoint y expone el JSON resultante.
   * @param {Blob|File} archivo
   * @returns {Promise<{ exito: boolean, datos?: any }>}
   */
  const detectarPlaca = useCallback(async (archivo) => {
    const mensajeValidacion = validarImagen(archivo)
    if (mensajeValidacion) {
      setError({ mensaje: mensajeValidacion })
      return { exito: false }
    }

    const endpoint = import.meta.env.VITE_OCR_ENDPOINT
    if (!endpoint) {
      setError({
        mensaje:
          'No se configuró VITE_OCR_ENDPOINT. Defina la variable de entorno con la URL del servicio de reconocimiento.',
      })
      return { exito: false }
    }

    setProcesando(true)
    setError(null)
    setResultado(null)

    try {
      const respuesta = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': archivo.type || 'application/octet-stream',
        },
        body: archivo,
      })

      if (!respuesta.ok) {
        const mensaje =
          MENSAJES_HTTP[respuesta.status] ||
          `El servicio respondió con un error (código ${respuesta.status}).`
        setError({ codigo: respuesta.status, mensaje })
        setProcesando(false)
        return { exito: false }
      }

      const datos = await respuesta.json()
      setResultado(datos)
      setProcesando(false)
      return { exito: true, datos }
    } catch (excepcion) {
      setError({
        mensaje:
          'No se pudo contactar al servicio de reconocimiento. Verifique su conexión e intente nuevamente.',
        detalle: excepcion?.message,
      })
      setProcesando(false)
      return { exito: false }
    }
  }, [])

  return { procesando, resultado, error, detectarPlaca, limpiarResultado }
}

export default useOcrPlaca