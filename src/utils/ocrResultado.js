/**
 * Utilidades para interpretar la respuesta del endpoint OCR sin inventar
 * ni modificar datos: solo normalizan el campo `estado` y dan formato de
 * presentación a los valores que la API ya entrega.
 */

const normalizar = (texto) =>
  (texto ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

/**
 * Clasifica la respuesta del endpoint en uno de los estados conocidos.
 *
 * @param {object|null} resultado
 * @returns {'encontrado'|'no_registrado'|'sin_placa'|'baja_confianza'|'multiples_placas'|'desconocido'}
 */
export const clasificarEstado = (resultado) => {
  if (!resultado) return 'desconocido'

  const estadoNormalizado = normalizar(resultado.estado)

  if (resultado.vehiculo_encontrado === true || estadoNormalizado === 'encontrado') {
    return 'encontrado'
  }
  if (estadoNormalizado.includes('sin_placa')) return 'sin_placa'
  if (estadoNormalizado.includes('baja_confianza')) return 'baja_confianza'
  if (
    estadoNormalizado.includes('multiples_placas') ||
    estadoNormalizado.includes('multiples_plates') ||
    estadoNormalizado.includes('multiple_placas')
  ) {
    return 'multiples_placas'
  }
  if (estadoNormalizado.includes('no_registrado') || resultado.vehiculo_encontrado === false) {
    return 'no_registrado'
  }

  return 'desconocido'
}

/** Obtiene el objeto del vehículo desde la respuesta. */
export const obtenerDatosVehiculo = (resultado) => resultado?.vehiculo ?? resultado ?? {}

/** Da formato a la confianza del OCR (0.989 → "98.9 %"). */
export const formatearConfianza = (confianza) => {
  if (confianza === null || confianza === undefined || confianza === '') return null
  if (typeof confianza === 'number') {
    const porcentaje = confianza <= 1 ? confianza * 100 : confianza
    return `${porcentaje.toFixed(1)} %`
  }
  return String(confianza)
}

/** Enmascara una cédula dejando visibles solo los últimos 4 dígitos. */
export const enmascararCedula = (cedula) => {
  if (!cedula) return null
  const texto = String(cedula)
  if (texto.includes('*')) return texto
  if (texto.length <= 4) return texto
  return '*'.repeat(texto.length - 4) + texto.slice(-4)
}

const limpiarBase64 = (valor) => {
  const texto = String(valor)
  const indice = texto.indexOf('base64,')
  return indice >= 0 ? texto.slice(indice + 'base64,'.length) : texto
}

const CANDIDATOS_BASE64 = [
  'imagen_marcada_base64',
  'imagen_base64_marcada',
  'imagen_procesada_base64',
  'imagen_placa_base64',
  'imagen_anotada_base64',
  'foto_marcada_base64',
  'image_marked_base64',
  'marked_image_base64',
]
const CANDIDATOS_MIME = [
  'imagen_marcada_mime_type',
  'imagen_marcada_mimetype',
  'imagen_procesada_mime_type',
  'mime_type_imagen_marcada',
  'marked_image_mime_type',
]
const CANDIDATOS_CONTENEDOR = ['imagen_marcada', 'imagen_procesada', 'marked_image']

const buscarEnObjeto = (obj, claves) => {
  if (!obj) return null
  for (const clave of claves) {
    if (obj[clave]) return obj[clave]
  }
  return null
}

/**
 * Construye la URL data: para mostrar la imagen ya marcada por el OCR.
 */
export const construirUrlImagenMarcada = (resultado) => {
  if (!resultado) return null

  let base64 = buscarEnObjeto(resultado, CANDIDATOS_BASE64)
  let mimeType = buscarEnObjeto(resultado, CANDIDATOS_MIME)

  if (!base64) {
    for (const clave of CANDIDATOS_CONTENEDOR) {
      const contenedor = resultado[clave]
      if (contenedor && typeof contenedor === 'object') {
        base64 = base64 ?? buscarEnObjeto(contenedor, ['base64', 'data', ...CANDIDATOS_BASE64])
        mimeType =
          mimeType ?? buscarEnObjeto(contenedor, ['mime_type', 'mimetype', 'tipo', ...CANDIDATOS_MIME])
      }
    }
  }

  if (!base64) {
    // eslint-disable-next-line no-console
    console.warn(
      '[MonitoreoEntrada] La respuesta del OCR no trae un campo reconocible de imagen marcada. Claves recibidas:',
      Object.keys(resultado),
      resultado,
    )
    return null
  }

  return `data:${mimeType || 'image/jpeg'};base64,${limpiarBase64(base64)}`
}