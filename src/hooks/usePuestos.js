import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNAS_PUESTOS = `
  id,
  codigo,
  columna,
  numero,
  sensor_id_rtdb,
  ruta_firebase,
  estado,
  distancia_cm,
  ultima_actualizacion,
  created_at
`

/**
 * Genera un código de registro único y legible para la tabla
 * registros_estacionamiento (se usa como identificador externo).
 */
const generarCodigoRegistro = () => `REG-${Date.now().toString(36).toUpperCase()}`

/**
 * Hook del panel "Puestos". Trae la grilla completa desde `puestos`,
 * permite CRUD y abre/cierra sesiones en `registros_estacionamiento`.
 * Se mantiene sincronizado en vivo con Supabase Realtime.
 *
 * El historial puntual de cada puesto se consulta con useHistorialPuesto.
 */
export const usePuestos = () => {
  const [puestos, setPuestos] = useState([])
  const [ocupacionActual, setOcupacionActual] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarPuestos = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('puestos')
      .select(COLUMNAS_PUESTOS)
      .order('columna', { ascending: true })
      .order('numero', { ascending: true })

    if (errorSupabase) {
      setPuestos([])
      setError(errorSupabase.message)
    } else {
      setPuestos(data ?? [])
    }

    setCargando(false)
  }, [])

  /**
   * Trae la sesión activa (fecha_salida IS NULL) de cada puesto ocupado
   * para poder mostrar qué vehículo lo está ocupando en este momento.
   */
  const cargarOcupacionActual = useCallback(async () => {
    const { data, error: errorSupabase } = await supabase
      .from('registros_estacionamiento')
      .select('id, puesto_id, vehiculo_id, placa_detectada, fecha_entrada')
      .is('fecha_salida', null)

    if (!errorSupabase) {
      const mapa = {}
      ;(data ?? []).forEach((registro) => {
        mapa[registro.puesto_id] = registro
      })
      setOcupacionActual(mapa)
    }
  }, [])

  useEffect(() => {
    cargarPuestos()
    cargarOcupacionActual()
  }, [cargarPuestos, cargarOcupacionActual])

  // Suscripción en tiempo real a ambas tablas.
  useEffect(() => {
    const canal = supabase
      .channel('puestos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'puestos' },
        () => cargarPuestos(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registros_estacionamiento' },
        () => cargarOcupacionActual(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [cargarPuestos, cargarOcupacionActual])

  const crearPuesto = useCallback(
    async (datos) => {
      const { data, error: errorSupabase } = await supabase
        .from('puestos')
        .insert([{ estado: 'DISPONIBLE', distancia_cm: null, ...datos }])
        .select(COLUMNAS_PUESTOS)
        .single()

      if (errorSupabase) throw new Error(errorSupabase.message)
      await cargarPuestos()
      return data
    },
    [cargarPuestos],
  )

  const actualizarPuesto = useCallback(
    async (id, datos) => {
      const { data, error: errorSupabase } = await supabase
        .from('puestos')
        .update(datos)
        .eq('id', id)
        .select(COLUMNAS_PUESTOS)
        .single()

      if (errorSupabase) throw new Error(errorSupabase.message)
      await cargarPuestos()
      return data
    },
    [cargarPuestos],
  )

  const eliminarPuesto = useCallback(
    async (id) => {
      const { error: errorSupabase } = await supabase.from('puestos').delete().eq('id', id)
      if (errorSupabase) throw new Error(errorSupabase.message)
      await cargarPuestos()
    },
    [cargarPuestos],
  )

  /**
   * Abre una sesión de ocupación: inserta la fila en
   * registros_estacionamiento y marca el puesto como 'OCUPADO'.
   */
  const marcarOcupado = useCallback(
    async (puesto, { vehiculoId, placa, distanciaCm, observacion } = {}) => {
      const { error: errorRegistro } = await supabase.from('registros_estacionamiento').insert([
        {
          codigo_registro: generarCodigoRegistro(),
          vehiculo_id: vehiculoId,
          puesto_id: puesto.id,
          placa_detectada: placa,
          sensor_id_rtdb: puesto.sensor_id_rtdb,
          fecha_entrada: new Date().toISOString(),
          distancia_cm_entrada: distanciaCm ?? null,
          estado: 'ACTIVO',
          observacion: observacion || null,
        },
      ])

      if (errorRegistro) {
        if (errorRegistro.code === '23505') {
          throw new Error('Este vehículo ya está ocupando otro espacio del parqueadero.')
        }
        throw new Error(errorRegistro.message)
      }

      const { error: errorPuesto } = await supabase
        .from('puestos')
        .update({
          estado: 'OCUPADO',
          distancia_cm: distanciaCm ?? null,
          ultima_actualizacion: new Date().toISOString(),
        })
        .eq('id', puesto.id)

      if (errorPuesto) throw new Error(errorPuesto.message)

      await Promise.all([cargarPuestos(), cargarOcupacionActual()])
      return true
    },
    [cargarPuestos, cargarOcupacionActual],
  )

  /**
   * Cierra la sesión de ocupación activa del puesto (si existe) y lo
   * marca como 'DISPONIBLE'.
   */
  const marcarLibre = useCallback(
    async (puesto, { distanciaCm, observacion } = {}) => {
      const { data: activo, error: errorBusqueda } = await supabase
        .from('registros_estacionamiento')
        .select('id, fecha_entrada')
        .eq('puesto_id', puesto.id)
        .is('fecha_salida', null)
        .order('fecha_entrada', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (errorBusqueda) throw new Error(errorBusqueda.message)

      if (activo) {
        const ahora = new Date()
        const duracionMinutos = Math.round(
          (ahora.getTime() - new Date(activo.fecha_entrada).getTime()) / 60000,
        )

        const { error: errorCierre } = await supabase
          .from('registros_estacionamiento')
          .update({
            fecha_salida: ahora.toISOString(),
            duracion_minutos: duracionMinutos,
            estado: 'FINALIZADO',
            observacion: observacion || null,
          })
          .eq('id', activo.id)

        if (errorCierre) throw new Error(errorCierre.message)
      }

      const { error: errorPuesto } = await supabase
        .from('puestos')
        .update({
          estado: 'DISPONIBLE',
          distancia_cm: distanciaCm ?? null,
          ultima_actualizacion: new Date().toISOString(),
        })
        .eq('id', puesto.id)

      if (errorPuesto) throw new Error(errorPuesto.message)

      await Promise.all([cargarPuestos(), cargarOcupacionActual()])
      return true
    },
    [cargarPuestos, cargarOcupacionActual],
  )

  const total = puestos.length
  const libres = puestos.filter((p) => p.estado === 'DISPONIBLE').length
  const ocupados = puestos.filter((p) => p.estado === 'OCUPADO').length
  const porcentajeDisponible = total > 0 ? (libres / total) * 100 : 0

  return {
    puestos,
    ocupacionActual,
    cargando,
    error,
    recargar: cargarPuestos,
    crearPuesto,
    actualizarPuesto,
    eliminarPuesto,
    marcarOcupado,
    marcarLibre,
    total,
    libres,
    ocupados,
    porcentajeDisponible,
  }
}

export default usePuestos