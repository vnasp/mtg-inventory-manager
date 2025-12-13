import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export default async function LoginPage() {
  const supabase = await createClient();

  // Verificar si hay usuario autenticado
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (user) {
    // Obtener el perfil para verificar el rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Si es admin, redirigir al backoffice
    if (profile?.role === 'admin') {
      redirect('/admin/backoffice');
    } else {
      // Si es cliente, redirigir al catálogo
      redirect('/');
    }
  }

  // Si no hay sesión, mostrar el formulario de login
  return <LoginClient />;
}
