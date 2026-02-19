import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CarSalesman',
  description: 'Marketing SaaS for car dealership salesmen',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
