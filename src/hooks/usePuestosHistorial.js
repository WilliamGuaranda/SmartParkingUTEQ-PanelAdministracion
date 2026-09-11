import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const LIMITE_REGISTROS = 300

/**
 * Hook del historial de cambios de PUESTOS (tabla puestos_historial).
 * Se mantiene sincronizado en tiempo real con Supabase Realtime.
 */
export const usePuestosHistorial = () => {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarHistorial = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('puestos_historial')
      .select('id, puesto_id, accion, datos_anteriores, datos_nuevos, modificado_en')
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

  // Realtime
  useEffect(() => {
    const canal = supabase
      .channel('puestos-historial-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'puestos_historial' },
        () => cargarHistorial(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [cargarHistorial])

  return { historial, cargando, error, recargar: cargarHistorial }
}

export default usePuestosHistorial