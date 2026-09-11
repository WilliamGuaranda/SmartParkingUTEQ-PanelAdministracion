/**
 * Validaciones del formulario de vehículos y propietarios.
 */

export const TIPOS_VEHICULO = [
  { value: 'AUTOMOVIL', label: 'Automóvil' },
  { value: 'CAMIONETA', label: 'Camioneta' },
  { value: 'SUV', label: 'SUV' },
  { value: 'MOTOCICLETA', label: 'Motocicleta' },
  { value: 'FURGONETA', label: 'Furgoneta' },
  { value: 'OTRO', label: 'Otro' },
]

const VALORES_TIPO_VALIDOS = TIPOS_VEHICULO.map((t) => t.value)
const ANIO_MINIMO = 1980

const esUrlValida = (valor) => {
  if (!valor) return true
  try {
    new URL(valor)
    return true
  } catch {
    return false
  }
}

const validarCedulaEcuatoriana = (cedula) => {
  if (!/^\d{10}$/.test(cedula)) return false
  const digitos = cedula.split('').map(Number)
  const provincia = Number(cedula.substring(0, 2))
  if (provincia < 1 || provincia > 24) return false
  if (digitos[2] > 6) return false

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  const suma = coeficientes.reduce((acumulado, coeficiente, indice) => {
    let valor = digitos[indice] * coeficiente
    if (valor >= 10) valor -= 9
    return acumulado + valor
  }, 0)

  const decenaSuperior = Math.ceil(suma / 10) * 10
  const digitoVerificador = decenaSuperior - suma === 10 ? 0 : decenaSuperior - suma

  return digitoVerificador === digitos[9]
}

export const normalizarPlaca = (placa) => placa.trim().toUpperCase().replace(/\s+/g, '')

export const validarFormularioVehiculo = (datos, esEdicion = false) => {
  const errores = {}
  const anioActual = new Date().getFullYear()

  const placa = normalizarPlaca(datos.placa || '')
  if (!placa) {
    errores.placa = 'La placa es obligatoria.'
  } else if (!/^[A-Z]{2,3}-?\d{3,4}$/.test(placa)) {
    errores.placa = 'Use el formato de placa ecuatoriana, por ejemplo ABC-1234.'
  }

  if (!datos.marca?.trim()) errores.marca = 'La marca es obligatoria.'
  if (!datos.modelo?.trim()) errores.modelo = 'El modelo es obligatorio.'

  const anio = Number(datos.anio)
  if (!datos.anio) {
    errores.anio = 'El año es obligatorio.'
  } else if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > anioActual + 1) {
    errores.anio = `Ingrese un año entre ${ANIO_MINIMO} y ${anioActual + 1}.`
  }

  if (!datos.color?.trim()) errores.color = 'El color es obligatorio.'

  if (!datos.tipo?.trim()) {
    errores.tipo = 'Seleccione el tipo de vehículo.'
  } else if (!VALORES_TIPO_VALIDOS.includes(datos.tipo)) {
    errores.tipo = 'El tipo de vehículo seleccionado no es válido.'
  }

  if (!datos.propietario_nombre?.trim()) {
    errores.propietario_nombre = 'El nombre del propietario es obligatorio.'
  }

  const cedula = (datos.cedula || '').trim()
  if (!esEdicion && !cedula) {
    errores.cedula = 'La cédula es obligatoria.'
  } else if (cedula && !validarCedulaEcuatoriana(cedula)) {
    errores.cedula = 'La cédula ingresada no es válida.'
  }

  const correo = (datos.correo_institucional || '').trim()
  if (!correo) {
    errores.correo_institucional = 'El correo institucional es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.correo_institucional = 'Ingrese un correo electrónico válido.'
  }

  if (!esUrlValida(datos.foto_url)) {
    errores.foto_url = 'Ingrese una URL válida para la foto del vehículo.'
  }
  if (!esUrlValida(datos.foto_fuente_url)) {
    errores.foto_fuente_url = 'Ingrese una URL válida para la fuente de la imagen.'
  }
  if (!esUrlValida(datos.foto_propietario_url)) {
    errores.foto_propietario_url = 'Ingrese una URL válida para la foto del propietario.'
  }

  return errores
}

export default validarFormularioVehiculo