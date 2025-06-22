import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AIConcierge from "@/components/ai-concierge";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "CyberFeast",
  description: "Fuel your hunger — from the future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <AIConcierge />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
