import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';
import BackofficeContent from './BackofficeContent';
import BackofficeHeader from './BackofficeHeader';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check authenticated user on the server
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (user) {
    // Check if user is admin and get full profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, email, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (profileData?.role === 'admin') {
      // If authenticated as admin, show backoffice
      return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50">
          <BackofficeHeader user={profileData} />
          <BackofficeContent />
        </div>
      );
    } else {
      // If authenticated but not admin, redirect to home
      redirect('/');
    }
  }

  // If no session, render the client-side login form
  return <LoginClient />;
}
