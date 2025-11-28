/**
 * Admin Supabase client using SERVICE_ROLE_KEY
 * 
 * ⚠️ ADVERTENCIA DE SEGURIDAD ⚠️
 * Este cliente usa la SERVICE_ROLE_KEY que tiene permisos de administrador.
 * SOLO debe usarse en:
 * - Route Handlers (/app/api/*)
 * - Server Actions
 * - Scripts de administración/cron jobs
 * 
 * NUNCA:
 * - Exponerlo en componentes cliente
 * - Usarlo en código que corre en el navegador
 * - Exportar la key con prefijo NEXT_PUBLIC_
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
    'This should be set in your environment variables (NOT with NEXT_PUBLIC_ prefix).'
  );
}

/**
 * Cliente de Supabase con privilegios de administrador.
 * Bypasea Row Level Security (RLS).
 * 
 * @returns Cliente de Supabase con service role key
 */
export const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
