import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const LIMITE_REGISTROS = 300

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarHistorial()
  }, [cargarHistorial])

  return { historial, cargando, error, recargar: cargarHistorial }
}

export default useHistorial