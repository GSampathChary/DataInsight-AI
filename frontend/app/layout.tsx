import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataInsight AI - AI-powered Data Analytics & Business Intelligence Platform',
  description: 'Upload datasets, perform automated EDA, view interactive dashboards, extract Gemini AI business insights, and train AutoML models.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07110c] text-emerald-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
