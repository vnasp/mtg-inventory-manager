import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import BackofficeContent from './BackofficeContent';
import BackofficeHeader from './BackofficeHeader';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (!user) redirect('/admin');

  // Obtener datos del perfil y verificar rol
  const { data: profileData } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  // Si no es admin, redirigir al catálogo
  if (profileData?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <BackofficeHeader
        user={{
          email: user.email ?? 'Sin correo',
          first_name: profileData?.first_name,
          last_name: profileData?.last_name,
        }}
      />

      {/* Main Content */}
      <BackofficeContent />
    </div>
  );
}
