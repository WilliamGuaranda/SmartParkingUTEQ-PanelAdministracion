/**
 * Traduce códigos HTTP del endpoint OCR a mensajes claros para el usuario.
 */

const MENSAJES_POR_CODIGO = {
  400: 'La imagen no es válida. Verifique el formato y dimensiones.',
  413: 'La imagen excede el tamaño máximo permitido (4 MiB).',
  415: 'Formato de imagen no admitido. Use JPG o PNG.',
  502: 'Error en el servicio. Intente nuevamente.',
  504: 'La solicitud tardó demasiado. Intente nuevamente.',
}

const MENSAJE_GENERICO = 'Ocurrió un error al procesar la imagen. Intente nuevamente.'
const MENSAJE_RED = 'No se pudo conectar con el servicio de reconocimiento. Verifique su conexión.'

export const obtenerMensajeErrorHttp = (status) => MENSAJES_POR_CODIGO[status] || MENSAJE_GENERICO

/**
 * Convierte cualquier error lanzado durante la solicitud OCR (HTTP,
 * red, o inesperado) en un mensaje amigable para mostrar en la UI.
 *
 * @param {Error} error
 * @returns {string}
 */
export const obtenerMensajeError = (error) => {
  if (error && typeof error.status === 'number') {
    return obtenerMensajeErrorHttp(error.status)
  }
  if (error instanceof TypeError) {
    // fetch lanza TypeError ante fallos de red (sin conexión, CORS, DNS, etc.)
    return MENSAJE_RED
  }
  return error?.message || MENSAJE_GENERICO
}