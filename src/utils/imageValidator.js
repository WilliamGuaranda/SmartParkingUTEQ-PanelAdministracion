const FORMATOS_ACEPTADOS = ['image/jpeg', 'image/png']
export const TAMANO_MAXIMO_BYTES = 4 * 1024 * 1024 // 4 MiB

/**
 * Valida un archivo de imagen antes de enviarlo al endpoint de OCR.
 * Revisa formato (JPG/PNG) y tamaño máximo (4 MiB) en el cliente, para
 * evitar solicitudes que el servidor rechazará con 400/413/415.
 *
 * @param {File|Blob} archivo
 * @returns {{ valido: boolean, mensaje: string }}
 */
export const validarImagen = (archivo) => {
  if (!archivo) {
    return { valido: false, mensaje: 'No se seleccionó ningún archivo.' }
  }

  if (!FORMATOS_ACEPTADOS.includes(archivo.type)) {
    return {
      valido: false,
      mensaje: 'Formato de imagen no admitido. Use JPG o PNG.',
    }
  }

  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return {
      valido: false,
      mensaje: 'La imagen excede el tamaño máximo permitido (4 MiB).',
    }
  }

  return { valido: true, mensaje: '' }
}