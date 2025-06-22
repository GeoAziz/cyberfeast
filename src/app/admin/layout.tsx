
import { redirect } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebase-server';
import { AdminSidebar } from '@/components/admin-sidebar';

async function getAdminUser() {
  try {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) return null;

    const decodedIdToken = await getAuth().verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedIdToken.uid).get();

    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return null;
    }
    
    return { uid: decodedIdToken.uid, ...userDoc.data() };
  } catch (error) {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-secondary/50">
      <AdminSidebar user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
