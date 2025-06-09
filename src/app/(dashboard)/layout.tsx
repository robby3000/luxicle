import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore as any); // Type cast to fix compatibility issues
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      
      <div className="flex-1 flex">
        <div className="hidden md:block w-64 border-r">
          <Sidebar />
        </div>
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
