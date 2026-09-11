/**
 * ============================================================================
 *  ocrService — Cliente HTTP del endpoint de reconocimiento de placas
 * ============================================================================
 *  Contrato con el endpoint (definido por el docente):
 *   - Método:   POST
 *   - Body:     BINARIO (Blob/File). NO JSON, NO Base64.
 *   - Header:   Content-Type = image/jpeg | image/png | application/octet-stream
 *   - URL:      import.meta.env.VITE_OCR_ENDPOINT (nunca hardcodeada)
 *
 *  Manejo de errores:
 *   - Lanza OcrHttpError si la respuesta no es 2xx, preservando el status
 *     para que utils/errorHandler.js lo traduzca a un mensaje claro.
 *   - Lanza Error genérico si el cuerpo no es JSON válido.
 * ============================================================================
 */

/**
 * Error de solicitud HTTP hacia el servicio de OCR. Conserva el código
 * de estado para que la capa de UI pueda traducirlo a un mensaje claro
 * (ver utils/errorHandler.js).
 */
export class OcrHttpError extends Error {
  constructor(status) {
    super(`El servicio OCR respondió con el código ${status}`)
    this.name = 'OcrHttpError'
    this.status = status
  }
}

/**
 * Envía una imagen (Blob/File) al endpoint OCR configurado en
 * VITE_OCR_ENDPOINT y devuelve el JSON de resultado.
 *
 * La URL del endpoint nunca se escribe en el código: se lee desde la
 * variable de entorno para no publicarla en el repositorio.
 *
 * @param {Blob|File} archivo - Imagen capturada o subida.
 * @returns {Promise<object>} Respuesta del endpoint ya parseada.
 * @throws {OcrHttpError} Si la respuesta HTTP no es 2xx.
 * @throws {Error}        Si VITE_OCR_ENDPOINT no está configurada o el cuerpo no es JSON.
 */
export const reconocerPlaca = async (archivo) => {
  const endpoint = import.meta.env.VITE_OCR_ENDPOINT

  if (!endpoint) {
    throw new Error(
      'VITE_OCR_ENDPOINT no está configurado. Defina la variable de entorno con la URL provista por el docente.',
    )
  }

  const respuesta = await fetch(endpoint, {
    method: 'POST',
    headers: {
      // Enviamos el MIME real del archivo para que el backend sepa interpretarlo.
      'Content-Type': archivo.type || 'application/octet-stream',
    },
    // El cuerpo va TAL CUAL como binario. No se envuelve en JSON.
    body: archivo,
  })

  if (!respuesta.ok) {
    throw new OcrHttpError(respuesta.status)
  }

  // Leemos como texto primero para poder dar un mensaje claro si no es JSON.
  const contenido = await respuesta.text()
  try {
    return JSON.parse(contenido)
  } catch {
    throw new Error('El servicio de reconocimiento devolvió una respuesta que no es JSON válido.')
  }
}