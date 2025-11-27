import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check authenticated user on the server
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (user) {
    // If already authenticated, redirect to backoffice
    redirect('/admin/backoffice');
  }

  // If no session, render the client-side login form
  return <LoginClient />;
}
