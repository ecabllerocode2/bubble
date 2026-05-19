import type { Metadata, Viewport } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Espejo — ¿Qué tan rara es tu música?",
  description: "Descubre qué tan dentro o fuera de la burbuja estás. Tu score underground basado en tu historial real de Spotify.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Espejo",
  },
};

export const viewport: Viewport = {
  themeColor: "#080810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${syne.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-[#080810] text-[#E8E8F0]">
        {children}
      </body>
    </html>
  );
}
