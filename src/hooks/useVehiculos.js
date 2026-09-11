import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNAS_PUBLICAS = `
  id,
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_propietario,
  propietario_nombre,
  correo_institucional,
  autorizado,
  activo
`

/**
 * Hook CRUD de vehículos.
 *  - Solo trae vehículos con `activo = true` (baja lógica).
 *  - `crearVehiculo` evita duplicados por cédula y placa, y reactiva
 *    registros dados de baja conservando su historial.
 *  - `desactivarVehiculo` verifica primero que el vehículo no esté
 *    ocupando un puesto; si lo está, lanza un error con código
 *    'VEHICULO_ESTACIONADO'.
 */
export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .select(COLUMNAS_PUBLICAS)
      .eq('activo', true)
      .order('propietario_nombre', { ascending: true })

    if (errorSupabase) {
      setVehiculos([])
      setError(errorSupabase.message)
    } else {
      setVehiculos(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarVehiculos()
  }, [cargarVehiculos])

  const crearVehiculo = useCallback(
    async (datos) => {
      // Buscamos por cédula y por placa para evitar duplicados.
      const [{ data: porCedula, error: errorCedula }, { data: porPlaca, error: errorPlaca }] =
        await Promise.all([
          supabase
            .from('vehiculos')
            .select(COLUMNAS_PUBLICAS)
            .eq('cedula_propietario', datos.cedula_propietario)
            .maybeSingle(),
          supabase
            .from('vehiculos')
            .select(COLUMNAS_PUBLICAS)
            .eq('placa', datos.placa)
            .maybeSingle(),
        ])

      if (errorCedula) throw new Error(errorCedula.message)
      if (errorPlaca) throw new Error(errorPlaca.message)

      if (porCedula && porPlaca && porCedula.id !== porPlaca.id) {
        throw new Error(
          'La cédula y la placa ya están asociadas a vehículos diferentes. Verifique los datos antes de continuar.',
        )
      }

      const existente = porCedula || porPlaca

      if (existente) {
        if (existente.activo) {
          throw new Error(
            `Ya existe un vehículo activo con la ${porCedula ? 'cédula' : 'placa'} ingresada.`,
          )
        }

        // Reactivar: conserva los registros de estacionamiento previos.
        const { data, error: errorReactivacion } = await supabase
          .from('vehiculos')
          .update({ ...datos, activo: true })
          .eq('id', existente.id)
          .select(COLUMNAS_PUBLICAS)
          .single()

        if (errorReactivacion) {
          throw new Error(errorReactivacion.message)
        }

        await cargarVehiculos()
        return { ...data, reactivado: true }
      }

      const { data, error: errorSupabase } = await supabase
        .from('vehiculos')
        .insert([{ ...datos, activo: true }])
        .select(COLUMNAS_PUBLICAS)
        .single()

      if (errorSupabase) {
        throw new Error(errorSupabase.message)
      }

      await cargarVehiculos()
      return data
    },
    [cargarVehiculos],
  )

  const actualizarVehiculo = useCallback(
    async (id, datos) => {
      const { data, error: errorSupabase } = await supabase
        .from('vehiculos')
        .update(datos)
        .eq('id', id)
        .select(COLUMNAS_PUBLICAS)
        .single()

      if (errorSupabase) {
        throw new Error(errorSupabase.message)
      }

      await cargarVehiculos()
      return data
    },
    [cargarVehiculos],
  )

  const obtenerEstacionamientoActivo = useCallback(async (id) => {
    const { data: registro, error: errorRegistro } = await supabase
      .from('registros_estacionamiento')
      .select('id, vehiculo_id, puesto_id, placa_detectada, fecha_entrada')
      .eq('vehiculo_id', id)
      .is('fecha_salida', null)
      .order('fecha_entrada', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (errorRegistro) {
      throw new Error(errorRegistro.message)
    }

    if (!registro) return null

    const { data: puesto, error: errorPuesto } = await supabase
      .from('puestos')
      .select('id, codigo')
      .eq('id', registro.puesto_id)
      .maybeSingle()

    if (errorPuesto) {
      throw new Error(errorPuesto.message)
    }

    return {
      ...registro,
      puesto_codigo: puesto?.codigo ?? `Puesto #${registro.puesto_id}`,
    }
  }, [])

  const desactivarVehiculo = useCallback(
    async (id) => {
      const estacionamiento = await obtenerEstacionamientoActivo(id)

      if (estacionamiento) {
        const errorEstacionado = new Error(
          `El vehículo se encuentra actualmente en el puesto ${estacionamiento.puesto_codigo}. Debe registrar su salida antes de retirarlo.`,
        )
        errorEstacionado.codigo = 'VEHICULO_ESTACIONADO'
        errorEstacionado.estacionamiento = estacionamiento
        throw errorEstacionado
      }

      const { data, error: errorSupabase } = await supabase
        .from('vehiculos')
        .update({ activo: false })
        .eq('id', id)
        .select(COLUMNAS_PUBLICAS)
        .single()

      if (errorSupabase) {
        throw new Error(errorSupabase.message)
      }

      await cargarVehiculos()
      return data
    },
    [cargarVehiculos, obtenerEstacionamientoActivo],
  )

  return {
    vehiculos,
    cargando,
    error,
    recargar: cargarVehiculos,
    crearVehiculo,
    actualizarVehiculo,
    desactivarVehiculo,
    obtenerEstacionamientoActivo,
  }
}

export default useVehiculos