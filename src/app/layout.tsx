import type { Metadata, Viewport } from "next";
import { Poppins, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";
import { BRAND } from "@/lib/brand";
import { SHOP, THEME_STYLE } from "@/config";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: `Order and customer management for the ${BRAND.name} tailor shop.`,
  ...(SHOP.favicon ? { icons: { icon: SHOP.favicon } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${manrope.variable} light`}
      style={Object.keys(THEME_STYLE).length ? (THEME_STYLE as React.CSSProperties) : undefined}
    >
      <body className="bg-canvas text-ink min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
