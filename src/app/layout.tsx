import type { Metadata, Viewport } from "next";
import { Poppins, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

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
  title: "My Brothers — Clothing & Tailoring",
  description: "Order and customer management for My Brothers tailor shop.",
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
    >
      <body className="bg-[#f8f9ff] text-[#0b1c30] min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
