import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'QualiApps Cloud - Gestion Qualité & Conformité Qualiopi',
  description: 'Plateforme SaaS de gestion qualité et conformité Qualiopi',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}

