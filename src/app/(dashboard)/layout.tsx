import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore as any); // Type cast to fix compatibility issues
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  
  // Use getUser instead of session.user for better security as recommended by Supabase
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header removed from here since it's already in root layout */}
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
