import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FloatingContactFab } from "@/components/layout/FloatingContactFab";
import { LogoIntro } from "@/components/ui/LogoIntro";
import { CursorFollower } from "@/components/ui/CursorFollower";
import "./globals.css";

// Единый шрифт сайта — Manrope. Google Fonts отдаёт диапазон 200–800,
// начертания 900 у Manrope нет — максимум ExtraBold 800 (font-black клампится
// к нему). Переменная замэплена в --font-heading и --font-body в globals.css.
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope-var",
  display: "swap",
});

// viewportFit: 'cover' обязателен — без него env(safe-area-inset-bottom) на
// iPhone равен 0, и нижнее меню/FAB встают вплотную к home indicator
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      className={`${manrope.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <LogoIntro />
        <CursorFollower />
        <SmoothScrollProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileBottomNav />
          <FloatingContactFab />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
