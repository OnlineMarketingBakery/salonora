import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Salonora", template: "%s | Salonora" },
  description: "Online bookings for salons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-[#f8fbff] font-sans text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
