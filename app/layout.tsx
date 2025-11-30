import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { AuthLoading } from "@/components/auth-loading";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "GMAO MVP - Sistema de Mantenimiento Industrial",
  description: "Sistema de Mantenimiento Industrial para gestión de activos y órdenes de trabajo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GMAO MVP",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "GMAO MVP",
    title: "GMAO MVP - Sistema de Mantenimiento Industrial",
    description: "Sistema de Mantenimiento Industrial para gestión de activos y órdenes de trabajo",
  },
  twitter: {
    card: "summary",
    title: "GMAO MVP",
    description: "Sistema de Mantenimiento Industrial para gestión de activos y órdenes de trabajo",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <AuthLoading>
                {children}
              </AuthLoading>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
