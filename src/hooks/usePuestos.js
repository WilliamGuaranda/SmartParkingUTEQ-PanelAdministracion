import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNAS_PUBLICAS = `
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

export const usePuestos = () => {
  const [puestos, setPuestos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)

  const cargarPuestos = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('puestos')
      .select(COLUMNAS_PUBLICAS)
      .order('numero', { ascending: true })

    if (errorSupabase) {
      setPuestos([])
      setError(errorSupabase.message)
    } else {
      setPuestos(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPuestos()
  }, [cargarPuestos])

  const crearPuesto = useCallback(
    async (datos) => {
      setGuardando(true)
      const { error: errorSupabase } = await supabase.from('puestos').insert([datos])
      setGuardando(false)

      if (errorSupabase) return { exito: false, mensaje: errorSupabase.message }

      await cargarPuestos()
      return { exito: true }
    },
    [cargarPuestos],
  )

  const actualizarPuesto = useCallback(
    async (id, datos) => {
      setGuardando(true)
      const { error: errorSupabase } = await supabase.from('puestos').update(datos).eq('id', id)
      setGuardando(false)

      if (errorSupabase) return { exito: false, mensaje: errorSupabase.message }

      await cargarPuestos()
      return { exito: true }
    },
    [cargarPuestos],
  )

  const eliminarPuesto = useCallback(
    async (id) => {
      setEliminandoId(id)
      const { error: errorSupabase } = await supabase.from('puestos').delete().eq('id', id)
      setEliminandoId(null)

      if (errorSupabase) return { exito: false, mensaje: errorSupabase.message }

      await cargarPuestos()
      return { exito: true }
    },
    [cargarPuestos],
  )

  return {
    puestos,
    cargando,
    error,
    guardando,
    eliminandoId,
    recargar: cargarPuestos,
    crearPuesto,
    actualizarPuesto,
    eliminarPuesto,
  }
}

export default usePuestos