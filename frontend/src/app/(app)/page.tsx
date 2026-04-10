import { LandingPage } from '@/components/landing/LandingPage';
import { isJwtTokenActive } from '@/lib/authToken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (isJwtTokenActive(token)) {
    redirect('/chat');
  }

  return <LandingPage />;
}
