import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider"
import "../../styles/theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Byncode",
  description: "Sistema de Gestão Empresarial",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Byncode",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/byncodeLogo.png", sizes: "192x192", type: "image/png" },
      { url: "/byncodeLogo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/byncodeLogo.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/byncodeLogo.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#970747",
};

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
