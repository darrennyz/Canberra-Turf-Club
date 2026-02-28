import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Canberra Turf Club',
  description: 'Multiplayer horse racing card game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
