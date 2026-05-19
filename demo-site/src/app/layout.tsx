import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CursorBlob } from "@/components/ui/CursorBlob";
import { StickyCtaButton } from "@/components/layout/StickyCtaButton";

const playfair = localFont({
  src: [
    {
      path: "../../public/fonts/playfair-display-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/playfair-display-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter-600.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: {
    default: "Братья Разумовские и Партнёры — юридическая компания в Москве",
    template: "%s | Братья Разумовские и Партнёры",
  },
  description:
    "Премиальная юридическая компания. Защита бизнеса и частных интересов на уровне Верховного Суда РФ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <CursorBlob />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <StickyCtaButton />
      </body>
    </html>
  );
}
