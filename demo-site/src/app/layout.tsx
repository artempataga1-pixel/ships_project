import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { LogoIntro } from "@/components/ui/LogoIntro";
import { StickyCtaButton } from "@/components/layout/StickyCtaButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SITE_URL, CONTACTS } from "@/lib/constants";

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
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Братья Разумовские и Партнёры — юридическая компания в Москве",
    template: "%s | Братья Разумовские и Партнёры",
  },
  description:
    "Премиальная юридическая компания. Защита бизнеса и частных интересов на уровне Верховного Суда РФ. Более 1650 успешных дел, 48+ млрд ₽ защищённых активов.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Братья Разумовские и Партнёры",
    title: "Братья Разумовские и Партнёры — юридическая компания в Москве",
    description:
      "Премиальная юридическая компания. Защита бизнеса и частных интересов на уровне Верховного Суда РФ.",
    images: [
      {
        url: "/images/brothers.jpg",
        width: 1200,
        height: 630,
        alt: "Братья Разумовские — партнёры юридической компании",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "Братья Разумовские и Партнёры",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  image: `${SITE_URL}/images/brothers.jpg`,
  description:
    "Премиальная юридическая компания. Защита бизнеса и частных интересов на уровне Верховного Суда РФ.",
  telephone: CONTACTS.phone,
  email: CONTACTS.email,
  priceRange: "₽₽₽",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Панфилова, д. 10",
    addressLocality: "Москва",
    postalCode: "125080",
    addressCountry: "RU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: CONTACTS.mapCenter[0],
    longitude: CONTACTS.mapCenter[1],
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "19:00",
  },
  areaServed: "RU",
  founder: [
    { "@type": "Person", name: "Олег Разумовский" },
    { "@type": "Person", name: "Константин Разумовский" },
  ],
  numberOfEmployees: { "@type": "QuantitativeValue", value: 11 },
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
      suppressHydrationWarning
    >
      <head>
        {/* Устанавливаем тему до рендера — предотвращает flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <LogoIntro />
        <Navbar />
        <main className="pb-16 lg:pb-0">{children}</main>
        <Footer />
        <StickyCtaButton />
        <ThemeToggle className="fixed bottom-6 left-6 z-50 hidden lg:flex" />
        <BottomNav />
      </body>
    </html>
  );
}
