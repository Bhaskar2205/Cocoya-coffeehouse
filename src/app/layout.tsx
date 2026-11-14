import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Cocoya",
    "Cocoya Coffee House",
    "coffee house",
    "café",
    "specialty coffee",
    "cold coffee",
    "cold brew",
    "iced latte",
    "frappe",
    "coffee near me",
    "cafe in Jaipur",
    "Malviya Nagar cafe",
    "coffee in Jaipur",
    "matcha Jaipur",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, address: false, email: false },
  category: "food & drink",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d0806",
  colorScheme: "dark",
};

/**
 * Runs before first paint: flags the cinematic intro curtain for the first
 * desktop visit of a session (and auto-clears as a failsafe). Tiny and inline
 * so there is never a flash of the curtain on phones or repeat visits.
 */
const introScript = `(function(){try{var d=document.documentElement;if(matchMedia('(min-width:1024px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&sessionStorage.getItem('cocoya-intro-seen')!=='1'){d.dataset.intro='pending';setTimeout(function(){delete d.dataset.intro},4800)}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
