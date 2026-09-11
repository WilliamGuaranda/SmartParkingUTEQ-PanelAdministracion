import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNAS_HISTORIAL = `
  id,
  codigo_registro,
  vehiculo_id,
  puesto_id,
  placa_detectada,
  fecha_entrada,
  fecha_salida,
  duracion_minutos,
  distancia_cm_entrada,
  estado,
  observacion,
  created_at
`

/**
 * Hook para el historial de sesiones de UN puesto (tabla
 * registros_estacionamiento, cada fila = una entrada/salida). Se
 * mantiene en vivo con Supabase Realtime.
 *
 * @param {number|string} puestoId - id numérico del puesto (puestos.id)
 * @param {number} limite - cantidad máxima de sesiones a traer (más recientes primero)
 */
export const useHistorialPuesto = (puestoId, limite = 20) => {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarHistorial = useCallback(async () => {
    if (!puestoId) {
      setHistorial([])
      setCargando(false)
      return
    }

    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('registros_estacionamiento')
      .select(COLUMNAS_HISTORIAL)
      .eq('puesto_id', puestoId)
      .order('fecha_entrada', { ascending: false })
      .limit(limite)

    if (errorSupabase) {
      setHistorial([])
      setError(errorSupabase.message)
    } else {
      setHistorial(data ?? [])
    }

    setCargando(false)
  }, [puestoId, limite])

  useEffect(() => {
    cargarHistorial()
  }, [cargarHistorial])

  useEffect(() => {
    if (!puestoId) return undefined

    const canal = supabase
      .channel(`historial-puesto-${puestoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registros_estacionamiento',
          filter: `puesto_id=eq.${puestoId}`,
        },
        () => cargarHistorial(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [puestoId, cargarHistorial])

  return { historial, cargando, error, recargar: cargarHistorial }
}

export default useHistorialPuesto