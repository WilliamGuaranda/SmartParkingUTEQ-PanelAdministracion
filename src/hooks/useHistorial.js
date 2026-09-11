import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const LIMITE_REGISTROS = 300

/**
 * Hook del historial de cambios de VEHÍCULOS (tabla vehiculos_historial).
 * Se mantiene sincronizado en tiempo real con Supabase Realtime.
 */
export const useHistorial = () => {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarHistorial = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos_historial')
      .select('id, vehiculo_id, accion, datos_anteriores, datos_nuevos, modificado_en')
      .order('modificado_en', { ascending: false })
      .limit(LIMITE_REGISTROS)

    if (errorSupabase) {
      setHistorial([])
      setError(errorSupabase.message)
    } else {
      setHistorial(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarHistorial()
  }, [cargarHistorial])

  // Realtime: refresca automáticamente cuando hay cambios
  useEffect(() => {
    const canal = supabase
      .channel('vehiculos-historial-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehiculos_historial' },
        () => cargarHistorial(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [cargarHistorial])

  return { historial, cargando, error, recargar: cargarHistorial }
}

export default useHistorial