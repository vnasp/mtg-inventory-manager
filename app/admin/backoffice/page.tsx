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

  // Obtener datos del perfil
  const { data: profileData } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex min-h-screen w-screen flex-col bg-slate-50">
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
