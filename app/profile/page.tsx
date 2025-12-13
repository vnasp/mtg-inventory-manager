import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ProfileClient from './ProfileClient';
import { cookies } from 'next/headers';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Si es admin, redirigir al backoffice
  if (profile?.role === 'admin') {
    redirect('/admin/backoffice');
  }

  return <ProfileClient profile={profile} />;
}
