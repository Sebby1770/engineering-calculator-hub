import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Sign in to Engineering Calculator Hub and manage your Pro subscription.',
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl('/account') },
};

export default function AccountPage() {
  return <AccountClient />;
}
