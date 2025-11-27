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

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start gap-8 p-4 lg:p-8">
      {/* Header */}
      <BackofficeHeader user={{ email: user.email ?? 'Sin correo' }} />

      {/* Tabs Content */}
      <BackofficeContent />
    </div>
  );
}
