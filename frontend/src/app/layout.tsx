import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RealEstateIQ — Intelligent Real Estate Price Prediction",
  description:
    "Data-driven residential property price prediction powered by machine learning, editorial aesthetic, and instant valuations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F1F0EF] text-[#0D0B0B] font-sans selection:bg-[#3C5484] selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

