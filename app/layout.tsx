import type {Metadata} from 'next';
import './globals.css'; // Global styles
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Dart Teller',
  description: 'Dart score teller en soundboard',
  manifest: '/manifest.webmanifest',
  themeColor: '#0f172a',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-zinc-950">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
