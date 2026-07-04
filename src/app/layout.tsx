import type { Metadata } from "next";
import { Unbounded, Golos_Text, Cormorant_Garamond } from "next/font/google";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const heading = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: "800",
  variable: "--font-heading-var",
  display: "swap",
});

const bodyFont = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-body-var",
  display: "swap",
});

// Только для надписи в hero — люксовая антиква ювелирного брендинга (аналог KIRIMARU с кириллицей)
const heroFont = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  variable: "--font-hero-var",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Шумская и Партнёры — Юридическая компания",
  description:
    "Представляем интересы бизнеса и частного капитала в сложных судебных процессах",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Шумская и Партнёры — Юридическая компания",
    description:
      "Представляем интересы бизнеса и частного капитала в сложных судебных процессах",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${heading.variable} ${bodyFont.variable} ${heroFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <SmoothScrollProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
