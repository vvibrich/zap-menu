import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Cardápio Zap - Seu Cardápio Digital',
  description: 'Crie seu cardápio digital e receba pedidos no WhatsApp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body suppressHydrationWarning className="antialiased bg-[#F8F7F4] text-[#141414] font-sans selection:bg-[#F27D26] selection:text-white">
        {children}
      </body>
    </html>
  );
}
