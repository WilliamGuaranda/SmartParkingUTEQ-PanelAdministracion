/**
 * ============================================================================
 *  Cliente Supabase (singleton)
 * ============================================================================
 *  Lee las credenciales de variables de entorno de Vite (VITE_*), que
 *  quedan embebidas en el bundle del cliente. Por eso:
 *   - SOLO se usa la clave pública (anon / publishable).
 *   - NUNCA debe ir aquí la service_role key.
 *
 *  Si falta cualquiera de las dos variables, la app falla al arrancar con
 *  un mensaje claro, en vez de fallar silenciosamente en la primera query.
 * ============================================================================
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Verifique VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en su archivo .env.',
  )
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

export default supabase